import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GUILD_ID = "1487042872107733044";

const AMA_ROLE_KEYWORDS = ["ama", "godfather", "boss", "owner", "leader"];
const KUYA_ROLE_KEYWORDS = ["kuya", "og", "underboss", "consigliere", "capo", "admin", "moderator", "mod"];
const KAPATID_ROLE_KEYWORDS = ["kapatid", "member", "fam"];

const normalizeRoleName = (roleName: string) => roleName.trim().toLowerCase();

const matchesRoleKeyword = (roleName: string, keywords: string[]) => {
  const normalizedRole = normalizeRoleName(roleName);
  return keywords.some((keyword) => normalizedRole.includes(keyword));
};

const getMemberCategory = (roleNames: string[]) => {
  if (roleNames.some((roleName) => matchesRoleKeyword(roleName, AMA_ROLE_KEYWORDS))) {
    return "Ama";
  }

  if (roleNames.some((roleName) => matchesRoleKeyword(roleName, KUYA_ROLE_KEYWORDS))) {
    return "Kuya";
  }

  if (roleNames.some((roleName) => matchesRoleKeyword(roleName, KAPATID_ROLE_KEYWORDS))) {
    return "Kapatid";
  }

  return "Kapatid";
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DISCORD_BOT_TOKEN = Deno.env.get('DISCORD_BOT_TOKEN');
    if (!DISCORD_BOT_TOKEN) {
      throw new Error('DISCORD_BOT_TOKEN is not configured');
    }

    // Fetch guild members (up to 100)
    const membersRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=100`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!membersRes.ok) {
      const errorBody = await membersRes.text();
      throw new Error(`Discord API error [${membersRes.status}]: ${errorBody}`);
    }

    const members = await membersRes.json();

    // Fetch guild roles
    const rolesRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!rolesRes.ok) {
      const errorBody = await rolesRes.text();
      throw new Error(`Discord roles API error [${rolesRes.status}]: ${errorBody}`);
    }

    const roles = await rolesRes.json();
    const roleMap = new Map(roles.map((r: any) => [r.id, { id: r.id, name: r.name, position: r.position, color: r.color }]));

    // Fetch online members via widget (requires Server Widget enabled in Discord settings)
   // Map of id/username -> status (online, idle, dnd)
    const userStatusMap = new Map<string, string>();
    let approxOnline = 0;
    try {
      const widgetRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/widget.json`);
      if (widgetRes.ok) {
        const widget = await widgetRes.json();
        approxOnline = widget.presence_count || 0;
        (widget.members || []).forEach((m: any) => {
          const status = m.status || 'online';
          if (m.id) userStatusMap.set(m.id, status);
          if (m.username) userStatusMap.set(m.username.toLowerCase(), status);
        });
      }
    } catch (_) {
      // Widget might be disabled
    }

    // Fetch guild info for approximate online count as fallback
    if (approxOnline === 0) {
      try {
        const guildRes = await fetch(
          `https://discord.com/api/v10/guilds/${GUILD_ID}?with_counts=true`,
          { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
        );
        if (guildRes.ok) {
          const guild = await guildRes.json();
          approxOnline = guild.approximate_presence_count || 0;
        }
      } catch (_) {}
    }

    // Map members to a clean format (fetch individual profiles for banner)
    const filteredMembers = members.filter((m: any) => !m.user?.bot);
    
    const mappedMembers = await Promise.all(filteredMembers.map(async (m: any) => {
        const user = m.user;
        const avatar = user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`;

        // Fetch full user profile for banner
        let banner: string | null = null;
        let bannerColor: string | null = null;
        try {
          const userRes = await fetch(`https://discord.com/api/v10/users/${user.id}`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
          });
          if (userRes.ok) {
            const fullUser = await userRes.json();
            if (fullUser.banner) {
              const ext = fullUser.banner.startsWith('a_') ? 'gif' : 'png';
              banner = `https://cdn.discordapp.com/banners/${user.id}/${fullUser.banner}.${ext}?size=600`;
            }
            if (fullUser.accent_color) {
              bannerColor = `#${fullUser.accent_color.toString(16).padStart(6, '0')}`;
            }
          }
        } catch (_) {}

        // Get highest role
        const memberRoles = (m.roles || [])
          .map((rid: string) => roleMap.get(rid))
          .filter(Boolean)
          .sort((a: any, b: any) => b.position - a.position);

        const topRole = memberRoles[0];
        const roleNames = memberRoles.map((role: any) => role.name);
        const category = getMemberCategory(roleNames);
        const matchedHierarchyRole =
          memberRoles.find((role: any) => {
            if (category === "Ama") return matchesRoleKeyword(role.name, AMA_ROLE_KEYWORDS);
            if (category === "Kuya") return matchesRoleKeyword(role.name, KUYA_ROLE_KEYWORDS);
            return matchesRoleKeyword(role.name, KAPATID_ROLE_KEYWORDS);
          }) || topRole;

        return {
          id: user.id,
          name: m.nick || user.global_name || user.username,
          username: user.username,
          avatar,
          banner,
          bannerColor,
          role: category,
          discordRole: matchedHierarchyRole?.name || topRole?.name || 'Member',
          roleColor: matchedHierarchyRole?.color || topRole?.color || 0,
          joinedAt: m.joined_at,
          status: userStatusMap.get(user.id) || userStatusMap.get(user.username.toLowerCase()) || userStatusMap.get((user.global_name || '').toLowerCase()) || 'offline',
          isOnline: userStatusMap.has(user.id) || userStatusMap.has(user.username.toLowerCase()) || userStatusMap.has((user.global_name || '').toLowerCase()),
        };
      }));

    // Compute stats
    const totalMembers = mappedMembers.length;
    const rolesCount = new Set(mappedMembers.map((m: any) => m.role)).size;
    const onlineCount = approxOnline || mappedMembers.filter((m: any) => m.isOnline).length;

    return new Response(JSON.stringify({ members: mappedMembers, stats: { totalMembers, rolesCount, onlineCount } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Discord members:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
