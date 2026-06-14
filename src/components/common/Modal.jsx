/**
 * Base modal overlay.
 * @param {{ children: React.ReactNode, onClose: () => void }} props
 */
export function Modal({ children, onClose }) {
  return (
    <div
      className="modal-bg"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}
