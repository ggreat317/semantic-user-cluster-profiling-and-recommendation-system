"use client"


import { useState } from "react";

export default function NotMyChat(){
   const profiles = [
    {
      pfp: "https://randomuser.me/api/portraits/men/32.jpg",
      username: "john_doe",
      about: "Web developer & coffee lover.",
      interests: ["React", "Next.js", "TypeScript", "UI/UX", "Music", "Travel"],
    },
    {
      pfp: "https://randomuser.me/api/portraits/women/44.jpg",
      username: "jane_smith",
      about: "Designer and illustrator.",
      interests: ["Art", "Design", "Photography", "Figma", "Yoga", "Books", "Travel"],
    },
    {
      pfp: "https://randomuser.me/api/portraits/men/65.jpg",
      username: "alex_lee",
      about: "Full-stack engineer.",
      interests: ["Node.js", "Docker", "Kubernetes", "Cloud", "Gaming"],
    },
  ];

  function SidebarProfiles() {
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    // If only one profile, expand it by default
    const shouldExpandAll = profiles.length === 1;

    return (
      <aside className="w-80 min-w-[220px] max-w-xs bg-gray-100 p-4 overflow-y-auto flex-shrink-0 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4">Profiles</h2>
        <div
          className="flex flex-col gap-4 flex-1"
          style={{ minHeight: 0 }}
        >
          {profiles.map((profile, idx) => {
            const expanded =
              shouldExpandAll ||
              expandedIdx === idx ||
              (expandedIdx === null && profiles.length === 1);

            return (
              <div
                key={profile.username}
                className={`bg-white rounded-lg shadow p-4 flex flex-col gap-2 transition-all duration-300 cursor-pointer ${
                  expanded ? "flex-1" : "flex-none"
                }`}
                style={{
                  minHeight: 0,
                  overflow: "hidden",
                  ...(expanded
                    ? { height: "100%" }
                    : { maxHeight: 120 }),
                }}
                onClick={() =>
                  setExpandedIdx(expanded ? null : idx)
                }
              >
                <div className="flex items-center gap-3">
                  <img
                    src={profile.pfp}
                    alt={profile.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <div className="font-semibold">{profile.username}</div>
                    <div className="text-xs text-gray-500">{profile.about}</div>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap gap-2 mt-2 transition-opacity duration-200 ${
                    expanded ? "opacity-100" : "opacity-60"
                  }`}
                  style={{
                    maxHeight: expanded ? 500 : 40,
                    overflow: "hidden",
                  }}
                >
                  {profile.interests
                    .reduce((pairs: string[][], interest, i, arr) => {
                      if (i % 2 === 0) pairs.push(arr.slice(i, i + 2));
                      return pairs;
                    }, [])
                    .map((pair, i) => (
                      <div
                        key={i}
                        className="flex gap-2 bg-gray-200 rounded px-2 py-1 text-xs font-medium"
                        style={{
                          minWidth: 0,
                          flex: "1 1 40%",
                          justifyContent: "center",
                        }}
                      >
                        {pair.map((interest, j) => (
                          <span key={j} className="truncate">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ))}
                </div>
                {!expanded && (
                  <div className="text-xs text-blue-500 mt-1 self-end">
                    Expand
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <div className="flex h-screen">
      <SidebarProfiles />
      {/* Main content placeholder */}
      <main className="flex-1 flex items-center justify-center bg-white">
        <span className="text-gray-400">Main content goes here.</span>
      </main>
    </div>
  );
}