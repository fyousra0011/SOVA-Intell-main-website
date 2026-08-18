const WHATSAPP_URL = "https://wa.link/1vqjow";

export function WhatsAppButton() {
  return (
    <>
      <style>{`
        .sova-whatsapp-float {
          position: fixed;
          right: 24px;
          bottom: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25D366;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 26px rgba(37, 211, 102, 0.35), 0 8px 20px rgba(0, 0, 0, 0.22);
          z-index: 9999;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          user-select: none;
        }

        .sova-whatsapp-float:hover,
        .sova-whatsapp-float:focus-visible {
          transform: scale(1.1);
          box-shadow: 0 14px 30px rgba(37, 211, 102, 0.42), 0 12px 26px rgba(0, 0, 0, 0.28);
        }

        .sova-whatsapp-float:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.7);
          outline-offset: 3px;
        }

        .sova-whatsapp-tooltip {
          position: absolute;
          right: 68px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(15, 15, 15, 0.96);
          color: #ffffff;
          font-size: 12px;
          line-height: 1.2;
          white-space: nowrap;
          padding: 8px 10px;
          border-radius: 999px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
        }

        .sova-whatsapp-float:hover .sova-whatsapp-tooltip,
        .sova-whatsapp-float:focus-visible .sova-whatsapp-tooltip,
        .sova-whatsapp-float:focus .sova-whatsapp-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(-4px);
        }

        @media (max-width: 768px) {
          .sova-whatsapp-float {
            right: 16px;
            bottom: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sova-whatsapp-float,
          .sova-whatsapp-tooltip {
            transition: none;
          }
        }
      `}</style>

      <a
        className="sova-whatsapp-float"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <span className="sova-whatsapp-tooltip">Chat with us on WhatsApp</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
          style={{ display: "block" }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M11.5 2C6.261 2 2 6.261 2 11.5c0 1.612.416 3.126 1.143 4.443L2 22l6.188-1.122A9.451 9.451 0 0011.5 21C16.739 21 21 16.739 21 11.5S16.739 2 11.5 2z" />
        </svg>
      </a>
    </>
  );
}
