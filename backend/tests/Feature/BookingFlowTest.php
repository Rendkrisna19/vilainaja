<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Lead;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    private const KEY = 'SB-Mid-server-test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.midtrans.server_key' => self::KEY,
            'services.midtrans.client_key' => 'SB-Mid-client-test',
            'booking.hold_minutes' => 30,
        ]);

        $this->fakeMidtrans();
    }

    private function fakeMidtrans(int $status = 201): void
    {
        Http::swap(new \Illuminate\Http\Client\Factory); // reset stub sebelumnya agar yang baru berlaku
        Http::fake([
            '*/snap/v1/transactions' => Http::response(['token' => 'snap-token-123', 'redirect_url' => 'https://pay.test/x'], $status),
            '*/v2/*/cancel' => Http::response(['status_code' => '200']),
        ]);
    }

    private function room(int $stock = 2, int $price = 500000, int $capacity = 2): Room
    {
        return Room::create(['name' => 'Kamar Uji', 'price' => $price, 'stock' => $stock, 'capacity' => $capacity, 'size' => 20, 'is_active' => true]);
    }

    private function customer(bool $withPhone = true): User
    {
        $u = new User(['name' => 'Budi', 'email' => 'budi'.uniqid().'@mail.com', 'password' => 'password123', 'phone' => $withPhone ? '6281234567890' : null]);
        $u->forceFill(['role' => 'customer'])->save();

        return $u;
    }

    private function book(User $user, Room $room, array $extra = [], string $in = '+3 days', string $out = '+5 days')
    {
        return $this->actingAs($user, 'sanctum')->postJson('/api/customer/bookings', array_merge([
            'room_id' => $room->id,
            'check_in' => now()->modify($in)->toDateString(),
            'check_out' => now()->modify($out)->toDateString(),
            'guests' => 2,
        ], $extra));
    }

    private function webhook(Booking $b, string $status = 'settlement', ?int $amount = null, ?string $key = null)
    {
        $amount ??= $b->total_price;
        $gross = number_format($amount, 2, '.', '');
        $payload = [
            'order_id' => $b->code,
            'status_code' => '200',
            'gross_amount' => $gross,
            'transaction_status' => $status,
            'payment_type' => 'bank_transfer',
            'transaction_id' => 'trx-1',
            'signature_key' => hash('sha512', $b->code.'200'.$gross.($key ?? self::KEY)),
        ];

        return $this->postJson('/api/payments/midtrans/notification', $payload);
    }

    /* ------------------------------ Auth ------------------------------ */

    public function test_register_requires_valid_whatsapp_and_creates_customer(): void
    {
        $bad = $this->postJson('/api/customer/register', [
            'name' => 'Sari', 'email' => 'sari@mail.com', 'phone' => '12345', 'password' => 'password123', 'password_confirmation' => 'password123',
        ]);
        $bad->assertStatus(422)->assertJsonValidationErrors('phone');

        $ok = $this->postJson('/api/customer/register', [
            'name' => 'Sari', 'email' => 'sari@mail.com', 'phone' => '0812-3456-7890', 'password' => 'password123', 'password_confirmation' => 'password123',
        ]);
        $ok->assertCreated()->assertJsonPath('user.phone', '6281234567890')->assertJsonPath('user.profile_complete', true);
        $this->assertSame('customer', User::where('email', 'sari@mail.com')->first()->role);
    }

    public function test_roles_are_separated(): void
    {
        $admin = new User(['name' => 'A', 'email' => 'a@a.com', 'password' => 'password123']);
        $admin->forceFill(['role' => 'admin'])->save();
        $customer = $this->customer();

        // admin tidak bisa masuk lewat pintu pelanggan, pelanggan tidak bisa masuk lewat pintu admin
        $this->postJson('/api/customer/login', ['email' => 'a@a.com', 'password' => 'password123'])->assertStatus(422);
        $this->postJson('/api/auth/login', ['email' => $customer->email, 'password' => 'password123'])->assertStatus(422);

        // token pelanggan ditolak di endpoint admin
        $this->actingAs($customer, 'sanctum')->getJson('/api/dashboard')->assertForbidden();
        $this->actingAs($admin, 'sanctum')->getJson('/api/customer/bookings')->assertForbidden();
    }

    /* ------------------------------ Booking & ketersediaan ------------------------------ */

    public function test_booking_requires_login_and_complete_profile(): void
    {
        $room = $this->room();
        $this->postJson('/api/customer/bookings', ['room_id' => $room->id])->assertUnauthorized();

        $this->book($this->customer(withPhone: false), $room)
            ->assertStatus(422)->assertJsonPath('code', 'profile_incomplete');
    }

    public function test_online_booking_holds_a_unit_and_returns_snap_token(): void
    {
        $room = $this->room(stock: 2);

        $res = $this->book($this->customer(), $room)->assertCreated();
        $res->assertJsonPath('payment.snap_token', 'snap-token-123')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.can_pay', true);

        $this->assertGreaterThan(1700, $res->json('data.seconds_left'));
        $this->assertSame(1, Booking::count());

        // unit ditahan → tampil di ketersediaan publik secara langsung
        $q = '?check_in='.now()->addDays(3)->toDateString().'&check_out='.now()->addDays(5)->toDateString();
        $this->getJson('/api/public/rooms'.$q)->assertJsonPath('data.0.booked_units', 1)->assertJsonPath('data.0.units_left', 1);
    }

    public function test_room_becomes_unavailable_when_all_units_are_booked(): void
    {
        $room = $this->room(stock: 1);
        $this->book($this->customer(), $room)->assertCreated();

        $this->book($this->customer(), $room)->assertStatus(409)->assertJsonPath('code', 'sold_out');

        $q = '?check_in='.now()->addDays(3)->toDateString().'&check_out='.now()->addDays(5)->toDateString();
        $this->getJson('/api/public/rooms'.$q)->assertJsonPath('data.0.units_left', 0)->assertJsonPath('data.0.is_available', false);

        // tanggal lain tetap tersedia
        $q2 = '?check_in='.now()->addDays(10)->toDateString().'&check_out='.now()->addDays(11)->toDateString();
        $this->getJson('/api/public/rooms'.$q2)->assertJsonPath('data.0.is_available', true);
    }

    public function test_partial_overlap_uses_peak_night_not_sum(): void
    {
        $room = $this->room(stock: 1);
        // dua booking berurutan (tidak bersamaan) di dalam rentang yang diminta → 1 unit sudah cukup untuk masing-masing
        Booking::create(['room_id' => $room->id, 'guest_name' => 'x', 'guest_phone' => '1', 'check_in' => now()->addDays(3), 'check_out' => now()->addDays(4), 'guests' => 1, 'total_price' => 1, 'status' => 'confirmed']);
        Booking::create(['room_id' => $room->id, 'guest_name' => 'y', 'guest_phone' => '1', 'check_in' => now()->addDays(4), 'check_out' => now()->addDays(5), 'guests' => 1, 'total_price' => 1, 'status' => 'confirmed']);

        // rentang yang bertabrakan dengan keduanya, stok 1 → penuh
        $this->book($this->customer(), $room, [], '+3 days', '+5 days')->assertStatus(409);
        // check-in tepat di hari check-out booking lain → boleh
        $this->book($this->customer(), $room, [], '+5 days', '+6 days')->assertCreated();
    }

    /* ------------------------------ Anti klik ganda ------------------------------ */

    public function test_double_submit_with_same_idempotency_key_creates_one_booking(): void
    {
        $room = $this->room(stock: 5);
        $user = $this->customer();

        $a = $this->book($user, $room, ['idempotency_key' => 'abc-123'])->assertCreated();
        $b = $this->book($user, $room, ['idempotency_key' => 'abc-123'])->assertOk();

        $this->assertSame($a->json('data.code'), $b->json('data.code'));
        $this->assertSame(1, Booking::count());
    }

    public function test_double_submit_without_key_reuses_identical_pending_booking(): void
    {
        $room = $this->room(stock: 5);
        $user = $this->customer();

        $a = $this->book($user, $room)->assertCreated();
        $b = $this->book($user, $room)->assertOk();

        $this->assertSame($a->json('data.code'), $b->json('data.code'));
        $this->assertSame(1, Booking::count());
    }

    public function test_user_cannot_hold_unlimited_unpaid_bookings(): void
    {
        $room = $this->room(stock: 10);
        $user = $this->customer();

        foreach ([3, 6, 9] as $d) {
            $this->book($user, $room, [], "+{$d} days", '+'.($d + 1).' days')->assertCreated();
        }
        $this->book($user, $room, [], '+12 days', '+13 days')->assertStatus(429)->assertJsonPath('code', 'too_many_pending');
    }

    /* ------------------------------ Gateway ------------------------------ */

    public function test_failed_gateway_releases_the_unit(): void
    {
        $this->fakeMidtrans(500);
        $room = $this->room(stock: 1);

        $this->book($this->customer(), $room)->assertStatus(502);

        $this->assertSame('cancelled', Booking::first()->status);

        $this->fakeMidtrans();
        $this->book($this->customer(), $room)->assertCreated(); // kamar bebas lagi
    }

    public function test_missing_midtrans_keys_return_clear_error_and_release(): void
    {
        config(['services.midtrans.server_key' => null, 'services.midtrans.client_key' => null]);
        $room = $this->room(stock: 1);

        $this->book($this->customer(), $room)->assertStatus(503)->assertJsonPath('code', 'payment_gateway');
        $this->assertSame('cancelled', Booking::first()->status);
    }

    /* ------------------------------ Webhook ------------------------------ */

    public function test_webhook_rejects_invalid_signature(): void
    {
        $b = $this->createPending();
        $this->webhook($b, 'settlement', null, 'kunci-salah')->assertForbidden();
        $this->assertSame('pending', $b->fresh()->status);
    }

    public function test_settlement_confirms_booking_and_is_idempotent(): void
    {
        $b = $this->createPending();

        $this->webhook($b)->assertOk();
        $this->webhook($b)->assertOk(); // notifikasi ganda

        $b->refresh();
        $this->assertSame('confirmed', $b->status);
        $this->assertNull($b->expires_at);
        $this->assertSame('paid', $b->payment->status);
        $this->assertNotNull($b->payment->paid_at);
    }

    public function test_webhook_with_wrong_amount_is_ignored(): void
    {
        $b = $this->createPending();
        $this->webhook($b, 'settlement', 1000)->assertOk();

        $this->assertSame('pending', $b->fresh()->status);
    }

    public function test_paid_booking_is_never_downgraded(): void
    {
        $b = $this->createPending();
        $this->webhook($b, 'settlement');
        $this->webhook($b, 'expire');

        $this->assertSame('confirmed', $b->fresh()->status);
    }

    public function test_cancel_or_expire_notification_releases_the_room(): void
    {
        $room = $this->room(stock: 1);
        $b = $this->createPending($room);

        $this->webhook($b, 'expire');
        $this->assertSame('cancelled', $b->fresh()->status);

        $this->book($this->customer(), $room)->assertCreated();
    }

    /* ------------------------------ Batas waktu bayar ------------------------------ */

    public function test_unpaid_booking_expires_and_frees_the_room(): void
    {
        $room = $this->room(stock: 1);
        $b = $this->createPending($room);

        $this->travel(31)->minutes();

        // sebelum scheduler berjalan pun, kamar sudah dianggap bebas (hold kedaluwarsa)
        $q = '?check_in='.now()->addDays(3)->toDateString().'&check_out='.now()->addDays(5)->toDateString();
        $this->getJson('/api/public/rooms'.$q)->assertJsonPath('data.0.is_available', true);

        $this->artisan('bookings:expire')->assertSuccessful();
        $this->assertSame('cancelled', $b->fresh()->status);
        $this->assertSame('expired', $b->payment->fresh()->status);
    }

    public function test_cannot_pay_after_hold_expired(): void
    {
        $b = $this->createPending();
        $user = $b->user;

        $this->travel(31)->minutes();

        $this->actingAs($user, 'sanctum')->postJson("/api/customer/bookings/{$b->code}/pay")->assertStatus(410);
    }

    public function test_customer_can_cancel_unpaid_but_not_paid_booking(): void
    {
        $b = $this->createPending();
        $this->actingAs($b->user, 'sanctum')->postJson("/api/customer/bookings/{$b->code}/cancel")->assertOk()->assertJsonPath('data.status', 'cancelled');

        $paid = $this->createPending();
        $this->webhook($paid);
        $this->actingAs($paid->user, 'sanctum')->postJson("/api/customer/bookings/{$paid->code}/cancel")->assertStatus(409);
    }

    public function test_customer_cannot_see_other_customers_booking(): void
    {
        $b = $this->createPending();

        $this->actingAs($this->customer(), 'sanctum')->getJson("/api/customer/bookings/{$b->code}")->assertNotFound();
    }

    /* ------------------------------ Admin ------------------------------ */

    public function test_admin_cannot_overbook_a_room(): void
    {
        $room = $this->room(stock: 1);
        $this->book($this->customer(), $room)->assertCreated();

        $admin = new User(['name' => 'A', 'email' => 'adm@a.com', 'password' => 'password123']);
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin, 'sanctum')->postJson('/api/bookings', [
            'room_id' => $room->id, 'guest_name' => 'Walk-in', 'guest_phone' => '0812', 'guests' => 1, 'status' => 'confirmed',
            'check_in' => now()->addDays(3)->toDateString(), 'check_out' => now()->addDays(4)->toDateString(),
        ])->assertStatus(409)->assertJsonPath('code', 'sold_out');

        $this->actingAs($admin, 'sanctum')->getJson('/api/rooms')->assertJsonPath('data.0.units_left', 1);
    }

    /* ------------------------------ Leads ------------------------------ */

    public function test_landing_lead_form_creates_lead_and_blocks_bots(): void
    {
        $this->postJson('/api/public/leads', ['name' => 'Rina', 'phone' => '081234567890', 'message' => 'Mau tanya kamar keluarga'])
            ->assertCreated();

        $lead = Lead::first();
        $this->assertSame('website', $lead->source);
        $this->assertSame('new', $lead->status);
        $this->assertSame('6281234567890', $lead->phone);

        $this->postJson('/api/public/leads', ['name' => 'Bot', 'phone' => '081234567890', 'message' => 'spam spam', 'website' => 'http://spam'])
            ->assertStatus(422);
        $this->assertSame(1, Lead::count());
    }

    private function createPending(?Room $room = null): Booking
    {
        $room ??= $this->room(stock: 5);
        $user = $this->customer();
        $this->book($user, $room)->assertCreated();

        return Booking::with(['payment', 'user'])->latest('id')->first();
    }
}
