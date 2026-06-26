import { getPostLoginRoute } from "../../lib/auth-adapter";

export default function AuthAdapterPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Firebase Auth adapter</p>
      <h2>Auth methods are staged</h2>
      <div className="split-list">
        <span>Email sign-in</span>
        <span>Account creation</span>
        <span>Email verification</span>
        <span>Password reset</span>
        <span>Password change</span>
        <span>Recent-login reauth</span>
        <span>Sign-out integration</span>
        <span>Client route: {getPostLoginRoute({ role: "client" })}</span>
        <span>Manager route: {getPostLoginRoute({ role: "manager" })}</span>
      </div>
    </section>
  );
}
