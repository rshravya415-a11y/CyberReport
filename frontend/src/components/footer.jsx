import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <ShieldCheck size={20} />
            </span>
            <span className="brand-copy">
              <strong>CyberReport</strong>
              <small>Incident Portal</small>
            </span>
          </Link>
          <p>
            An independent, accessible platform designed to assist citizens in
            documenting, organizing, and tracking digital crime complaints.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/report">Report Incident</Link></li>
            <li><Link to="/track">Track Complaint</Link></li>
            <li><Link to="/dashboard">User Portal</Link></li>
            <li><Link to="/admin/login">Admin Access</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Cyber Safety</h4>
          <ul>
            <li><a href="/#safety">Safety Tips</a></li>
            <li><Link to="/resources">Security Guidelines</Link></li>
            <li><Link to="/security-tools">Security Tools</Link></li>
            <li><a href="/#faq">Frequently Asked Questions</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Emergency Assistance</h4>
          <ul>
            <li style={{ color: "#f43f5e", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <PhoneCall size={15} /> Helpline: 1930
            </li>
            <li>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                Official Govt Portal <ExternalLink size={13} />
              </a>
            </li>
            <li>Immediate Bank Notification</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CyberReport. All rights reserved.</span>
        <span>Dedicated to digital integrity and crime awareness.</span>
      </div>
    </footer>
  );
}
