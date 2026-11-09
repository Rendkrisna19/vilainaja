<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Resources\LeadResource;
use App\Models\Booking;
use App\Models\Lead;
use App\Models\Room;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = today();
        $monthStart = $today->copy()->startOfMonth();

        $totalStock = (int) Room::where('is_active', true)->sum('stock');
        $occupied = Booking::whereIn('status', ['confirmed', 'checked_in'])
            ->whereDate('check_in', '<=', $today)
            ->whereDate('check_out', '>', $today)
            ->count();

        $stats = [
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'revenue_month' => (int) Booking::whereIn('status', Booking::ACTIVE_STATUSES)
                ->whereDate('check_in', '>=', $monthStart)
                ->whereDate('check_in', '<=', $today->copy()->endOfMonth())
                ->sum('total_price'),
            'occupancy' => $totalStock > 0 ? (int) round(min($occupied, $totalStock) / $totalStock * 100) : 0,
            'occupied_units' => $occupied,
            'total_units' => $totalStock,
            'new_leads' => Lead::where('status', 'new')->count(),
            'active_rooms' => Room::where('is_active', true)->count(),
        ];

        $byStatus = Booking::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $statusCounts = collect(Booking::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($byStatus[$s] ?? 0)]);

        // 6 bulan terakhir (termasuk bulan ini), dikelompokkan per tanggal check-in.
        $from = $monthStart->copy()->subMonths(5);
        $rows = Booking::whereDate('check_in', '>=', $from)
            ->where('status', '!=', 'cancelled')
            ->get(['check_in', 'total_price']);

        $monthly = collect(range(0, 5))->map(function ($i) use ($from, $rows) {
            $month = $from->copy()->addMonths($i);
            $inMonth = $rows->filter(fn ($r) => $r->check_in->isSameMonth($month));

            return [
                'month' => $month->format('Y-m'),
                'label' => $month->locale('id')->translatedFormat('M'),
                'bookings' => $inMonth->count(),
                'revenue' => (int) $inMonth->sum('total_price'),
            ];
        })->values();

        return response()->json([
            'stats' => $stats,
            'status_counts' => $statusCounts,
            'monthly' => $monthly,
            'recent_bookings' => BookingResource::collection(
                Booking::with('room:id,name,image_url')->latest('id')->limit(6)->get()
            ),
            'upcoming_checkins' => BookingResource::collection(
                Booking::with('room:id,name,image_url')
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->whereDate('check_in', '>=', $today)
                    ->orderBy('check_in')
                    ->limit(5)
                    ->get()
            ),
            'recent_leads' => LeadResource::collection(Lead::latest('id')->limit(5)->get()),
        ]);
    }
}
