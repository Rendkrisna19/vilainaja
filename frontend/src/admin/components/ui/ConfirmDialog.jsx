import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open, title = 'Hapus data?', message, confirmText = 'Hapus', loading = false, onConfirm, onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onCancel}
      dismissible={!loading}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Batal</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--a-muted)', fontSize: 14 }}>{message}</p>
    </Modal>
  )
}
