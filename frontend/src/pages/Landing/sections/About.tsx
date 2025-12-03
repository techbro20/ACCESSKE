import { colors } from '../../../theme/colors';

export default function About() {
  const features = [
    {
      title: 'Profile Management',
      description: 'Maintain and update your professional profile',
      icon: '👤'
    },
    {
      title: 'Event Notifications',
      description: 'Stay informed about upcoming alumni events',
      icon: '📅'
    },
    {
      title: 'Community Chat',
      description: 'Connect and communicate with fellow alumni',
      icon: '💬'
    },
    {
      title: 'Notice Board',
      description: 'Access important announcements and updates',
      icon: '📢'
    }
  ];

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${colors.black} 0%, #1a1a1a 100%)`,
        color: colors.beige,
        padding: '80px 20px',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              marginBottom: '15px',
              fontWeight: 700
            }}
          >
            About the System
          </h2>
          <div
            style={{
              width: '60px',
              height: '4px',
              background: `linear-gradient(90deg, ${colors.red} 0%, ${colors.blue} 100%)`,
              margin: '0 auto 20px'
            }}
          />
          <p
            style={{
              maxWidth: '800px',
              margin: '0 auto 20px',
              fontSize: 'clamp(16px, 2vw, 18px)',
              lineHeight: '1.6',
              color: '#e0e0e0'
            }}
          >
            A comprehensive platform designed to connect over 5,000 ACCES Kenya alumni,
            enabling streamlined communication, profile tracking, and event notifications.
          </p>
          <p
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              lineHeight: '1.6',
              color: colors.beige,
              fontWeight: 600,
              fontStyle: 'italic',
              borderTop: `2px solid ${colors.red}`,
              borderBottom: `2px solid ${colors.blue}`,
              padding: '15px 20px',
              borderRadius: '8px'
            }}
          >
            Alleviating poverty through education
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginTop: '50px'
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '30px',
                borderRadius: '8px',
                border: `1px solid rgba(193, 18, 31, 0.2)`,
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = colors.red;
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(193, 18, 31, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  marginBottom: '10px',
                  fontWeight: 600,
                  color: colors.beige
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#b0b0b0',
                  lineHeight: '1.5'
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
