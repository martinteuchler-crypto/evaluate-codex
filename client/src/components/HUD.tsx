export default function HUD({ state }: { state: any }) {
  return (
    <div style={{ padding: 8 }}>
      <div>Turn: {state.turn}</div>
    </div>
  );
}
