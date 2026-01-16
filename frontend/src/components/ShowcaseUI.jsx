import React from 'react';

function ShowcaseUI(props) {
  const {
    BACKEND_URL,
    SOCIAL_PLATFORMS,
    profile,
    groupedVideos,
    loading,
    error,
    onTrackSocialClick,
    collectionLabel,
    HomeLinkComponent,
  } = props;

  // Glassmorphic background gradient (matching Dashboard)
  const bgGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #4f46e5 100%)';

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '1.25rem', color: 'white' }}>Loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(14px)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(148, 163, 184, 0.5)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h1
            style={{
              fontSize: '1.5rem',
              color: 'white',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Creator Not Found
          </h1>
          <p
            style={{
              color: 'rgba(226, 232, 240, 0.9)',
              marginBottom: '1.5rem',
            }}
          >
            {error || 'This creator could not be located.'}
          </p>
          {HomeLinkComponent ? (
            <HomeLinkComponent
              to="/"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: '600',
                padding: '0.5rem 1.25rem',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
                borderRadius: '9999px',
                display: 'inline-block',
                border: '1px solid rgba(191, 219, 254, 0.7)',
              }}
            >
              ← Go Home
            </HomeLinkComponent>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
      }}
    >
      {/* Header / Profile section */}
      <div
        style={{
          background: profile.banner_image
            ? `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.85)), url(${BACKEND_URL}${profile.banner_image})`
            : 'rgba(15, 23, 42, 0.75)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.3)',
          position: 'relative',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '2.5rem 1rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {profile.profile_picture && (
            <img
              src={`${BACKEND_URL}${profile.profile_picture}`}
              alt={profile.display_name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '1rem',
                border: '3px solid rgba(139, 92, 246, 0.6)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
              }}
            />
          )}

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.25rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {profile.display_name}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(199, 210, 254, 0.9)',
              marginBottom: '0.75rem',
            }}
          >
            @{profile.username}
          </p>

          {profile.bio && (
            <p
              style={{
                fontSize: '0.95rem',
                color: 'rgba(226, 232, 240, 0.95)',
                maxWidth: '600px',
                margin: '0 auto 1rem',
                lineHeight: 1.5,
              }}
            >
              {profile.bio}
            </p>
          )}

          {/* Social media links */}
          {profile.social_media_links &&
            profile.social_media_links.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {profile.social_media_links.map((link, index) => {
                  const platformKey = link.platform.toLowerCase();
                  const platformInfo = SOCIAL_PLATFORMS[platformKey] || {
                    icon: '🔗',
                    color: '#8b5cf6',
                    label: link.custom_name || link.platform,
                  };

                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        onTrackSocialClick &&
                        onTrackSocialClick(link.platform)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(148, 163, 184, 0.5)',
                        borderRadius: '9999px',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'rgba(15, 23, 42, 0.8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>
                        {platformInfo.icon}
                      </span>
                      {platformInfo.label}
                    </a>
                  );
                })}
              </div>
            )}

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(14px)',
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(34, 211, 238, 0.4)',
                boxShadow: '0 8px 32px rgba(34, 211, 238, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: '#22d3ee',
                }}
              >
                {profile.total_videos}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(226, 232, 240, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Verified Videos
              </div>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(14px)',
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
              }}
            >
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: '#a78bfa',
                }}
              >
                {new Date(profile.joined_at).getFullYear()}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(226, 232, 240, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Joined
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections / Videos */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem',
        }}
      >
        {/* Collection Label */}
        {collectionLabel && Object.keys(groupedVideos).length > 0 && (
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {collectionLabel}
          </h2>
        )}

        {Object.keys(groupedVideos).length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(14px)',
              borderRadius: '1rem',
              border: '1px solid rgba(148, 163, 184, 0.3)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
            <p style={{ fontSize: '1.125rem', color: 'white' }}>
              No videos in folders yet
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(226, 232, 240, 0.7)',
                marginTop: '0.5rem',
              }}
            >
              Videos must be added to showcase folders to appear here
            </p>
          </div>
        ) : (
          Object.keys(groupedVideos).map((folderId) => {
            const folderData = groupedVideos[folderId];
            if (!folderData.videos || folderData.videos.length === 0) {
              return null;
            }

            return (
              <div key={folderId} style={{ marginBottom: '2.5rem' }}>
                {/* Folder header card */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(14px)',
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2.5rem',
                        flexShrink: 0,
                      }}
                    >
                      {folderData.icon_emoji || '📁'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: 'white',
                          marginBottom: '0.25rem',
                        }}
                      >
                        {folderData.folderName}
                      </h2>
                      {folderData.description && (
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'rgba(226, 232, 240, 0.8)',
                            margin: 0,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {folderData.description}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.375rem 0.875rem',
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                          color: 'white',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          border: '1px solid rgba(139, 92, 246, 0.5)',
                        }}
                      >
                        {folderData.videos.length}{' '}
                        {folderData.videos.length === 1
                          ? 'video'
                          : 'videos'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {folderData.videos.map((video) => (
                    <div
                      key={video.video_id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(14px)',
                        borderRadius: '0.875rem',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        transition: 'transform 0.2s, border-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '130px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {video.thumbnail_url ? (
                          <img
                            src={`${BACKEND_URL}${video.thumbnail_url}`}
                            alt={video.verification_code}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>🎬</span>
                        )}
                      </div>

                      <div style={{ padding: '0.875rem' }}>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: '#22d3ee',
                            marginBottom: '0.5rem',
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {video.verification_code}
                        </div>

                        <div
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            background:
                              video.source === 'bodycam'
                                ? 'rgba(251, 191, 36, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                            color:
                              video.source === 'bodycam'
                                ? '#fbbf24'
                                : '#60a5fa',
                            border: `1px solid ${
                              video.source === 'bodycam'
                                ? 'rgba(251, 191, 36, 0.4)'
                                : 'rgba(59, 130, 246, 0.4)'
                            }`,
                            borderRadius: '0.375rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {video.source === 'bodycam'
                            ? '📱 BodyCam'
                            : '💻 Studio'}
                        </div>

                        {video.description && (
                          <p
                            style={{
                              fontSize: '0.8rem',
                              color: 'rgba(226, 232, 240, 0.9)',
                              marginBottom: '0.5rem',
                              lineHeight: '1.4',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {video.description}
                          </p>
                        )}

                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'rgba(156, 163, 175, 0.9)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {new Date(
                            video.captured_at
                          ).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(
                            video.captured_at
                          ).toLocaleTimeString()}
                        </div>

                        {video.tags && video.tags.length > 0 && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.25rem',
                              }}
                            >
                              {video.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: '0.2rem 0.4rem',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    color: '#c4b5fd',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.65rem',
                                    fontWeight: '500',
                                  }}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {video.external_link && (
                          <a
                            href={video.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              padding: '0.5rem 0.875rem',
                              background:
                                'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.95))',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              border: '1px solid rgba(191, 219, 254, 0.5)',
                              transition: 'all 0.2s',
                              width: '100%',
                              textAlign: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow =
                                '0 8px 24px rgba(139, 92, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {video.platform
                              ? `View on ${video.platform}`
                              : 'View Original'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ShowcaseUI;
