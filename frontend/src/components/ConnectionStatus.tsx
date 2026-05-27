export function ConnectionStatus({ online, pendingCount }: { online: boolean; pendingCount: number }) {
  return (
    <div className="chip">
      <strong>{online ? 'Online' : 'Sin conexión'}</strong>
      <span>{online ? 'Todo listo' : 'podés cargar el parte igual'}</span>
      <span>·</span>
      <span>{pendingCount} pendiente(s)</span>
    </div>
  );
}
