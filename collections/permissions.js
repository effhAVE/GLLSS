module.exports = {
  users: {
    general: [
      {
        value: "general.isHost",
        name: "Host tools access",
        description: "Access to calendar and hosts' helpers"
      },
      {
        value: "general.isTL",
        name: "TL tools access",
        description: "Access to schedule view"
      }
    ],
    roles: [
      {
        value: "roles.create",
        name: "Create roles",
        description: "Create new roles"
      },
      {
        value: "roles.view",
        name: "View roles",
        description: "View roles and their permissions"
      },
      {
        value: "roles.update",
        name: "Update roles",
        description: "Modify properties of an existing role",
        props: [
          {
            value: "rolesProps.name",
            name: "Name"
          },
          {
            value: "rolesProps.color",
            name: "Color"
          },
          {
            value: "rolesProps.importance",
            name: "Importance"
          },
          {
            value: "rolesProps.editable",
            name: "Editable"
          },
          {
            value: "rolesProps.permissions",
            name: "Permissions"
          }
        ]
      },
      {
        value: "roles.delete",
        name: "Delete roles",
        description: "Delete roles with editable property set to true"
      }
    ],
    profiles: [
      {
        value: "users.permanent",
        name: "Permament user",
        description: "User with this role cannot be deleted"
      },
      {
        value: "users.view",
        name: "View users",
        description: "View user profiles"
      },
      {
        value: "users.viewHiddenFields",
        name: "View users' hidden fields",
        description: "View fields that were hidden in preferences settings"
      },
      {
        value: "users.confirm",
        name: "Confirm users",
        description: "Confirm newly registered users"
      },
      {
        value: "users.update",
        name: "Update users",
        description: "Modify properties of existing users",
        props: [
          {
            value: "usersProps.avatar",
            name: "Avatar"
          }
        ]
      },
      {
        value: "users.delete",
        name: "Delete users",
        description: "Completely remove users from the database"
      },
      {
        value: "users.modifyRoles",
        name: "Grant/revoke roles",
        description: "Change roles of an existing user"
      }
    ],
    data: [
      {
        value: "data.create",
        name: "Create data month",
        description: "Create new data month for calculations"
      },
      {
        value: "data.view",
        name: "View my data",
        description: "View data calculations for myself only and general stats"
      },
      {
        value: "data.viewAll",
        name: "View all",
        description: "View data calculations for everyone"
      },
      {
        value: "data.update",
        name: "Recalculate data",
        description: "Enables manual data recalculation"
      },
      {
        value: "data.viewLogs",
        name: "View logs",
        description: "View log of previous calculations"
      }
    ]
  },
  tournaments: {
    hosting: [
      {
        value: "hosting.fillAvailability",
        name: "Fill availability",
        description: "Ability to fill availability"
      },
      {
        value: "hosting.canHost",
        name: "Can host",
        description: "Can be chosen as a host"
      },
      {
        value: "hosting.canLead",
        name: "Can lead",
        description: "Can be chosen as a team leader"
      }
    ],
    rounds: [
      {
        value: "rounds.create",
        name: "Create rounds",
        description: "Create new rounds"
      },
      {
        value: "rounds.view",
        name: "View rounds",
        description: "See round-specific informations"
      },
      {
        value: "rounds.update",
        name: "Update rounds",
        description: "Modify properties of an existing round",
        props: [
          {
            value: "roundsProps.name",
            name: "Name "
          },
          {
            value: "roundsProps.dates",
            name: "Dates "
          },
          {
            value: "roundsProps.bestOf",
            name: "Best of "
          },
          {
            value: "roundsProps.prepTime",
            name: "Preparation time "
          }
        ]
      },
      {
        value: "rounds.delete",
        name: "Delete rounds",
        description: "Delete any round"
      }
    ],
    tournaments: [
      {
        value: "tournaments.create",
        name: "Create tournaments",
        description: "Create new tournaments"
      },
      {
        value: "tournaments.view",
        name: "View tournaments",
        description: "See tournament-specific informations"
      },
      {
        value: "tournaments.update",
        name: "Update tournaments",
        description: "Modify properties of an existing tournament",
        props: [
          {
            value: "tournamentsProps.name",
            name: "Name "
          },

          {
            value: "tournamentsProps.series",
            name: "Series "
          },

          {
            value: "tournamentsProps.gllURL",
            name: "GLL URL "
          },
          {
            value: "tournamentsProps.dates",
            name: "Dates "
          },
          {
            value: "tournamentsProps.game",
            name: "Game "
          },
          {
            value: "tournamentsProps.region",
            name: "Region "
          },
          {
            value: "tournamentsProps.countedByRounds",
            name: "Counted by rounds "
          }
        ]
      },
      {
        value: "tournaments.delete",
        name: "Delete tournaments",
        description: "Delete any tournament"
      },
      {
        value: "tournaments.copy",
        name: "Copy tournaments",
        description: "Copy an existing tournament"
      }
    ],
    series: [
      {
        value: "series.create",
        name: "Create series",
        description: "Create new series"
      },
      {
        value: "series.view",
        name: "View series",
        description: "See series-specific informations"
      },
      {
        value: "series.update",
        name: "Update series",
        description: "Modify properties of existing series",
        props: [
          {
            value: "seriesProps.name",
            name: "Name"
          },
          {
            value: "seriesProps.dates",
            name: "Dates"
          },
          {
            value: "seriesProps.game",
            name: "Game"
          },
          {
            value: "seriesProps.region",
            name: "Region"
          },
          {
            value: "seriesProps.recurrence",
            name: "Recurrence"
          }
        ]
      },
      {
        value: "series.delete",
        name: "Delete series",
        description: "Delete any series"
      }
    ],
    hosts: [
      {
        value: "hosts.add",
        name: "Add hosts",
        description: "Select hosts from availability list"
      },
      {
        value: "hosts.view",
        name: "View hosts",
        description: "See round's hosts list"
      },
      {
        value: "hosts.update",
        name: "Update hosts",
        description: "Modify properties of any host",
        props: [
          {
            value: "hostsProps.ready",
            name: "Ready"
          },
          {
            value: "hostsProps.lostHosting",
            name: "Lost hosting "
          },

          {
            value: "hostsProps.balance",
            name: "Balance"
          },
          {
            value: "hostsProps.group",
            name: "Group"
          }
        ]
      },
      {
        value: "hosts.remove",
        name: "Remove hosts",
        description: "Remove hosts from hosting list"
      }
    ],
    teamLeads: [
      {
        value: "teamLeads.add",
        name: "Add teamleads",
        description: "Select teamleads from availability list"
      },
      {
        value: "teamLeads.view",
        name: "View teamleads",
        description: "See round's teamleads list"
      },
      {
        value: "teamLeads.update",
        name: "Update teamleads",
        description: "Modify properties of any teamleader",
        props: [
          {
            value: "teamLeadsProps.ready",
            name: "Ready"
          },
          {
            value: "teamLeadsProps.lostLeading",
            name: "Lost leading"
          },

          {
            value: "teamLeadsProps.balance",
            name: "Balance"
          }
        ]
      },
      {
        value: "teamLeads.remove",
        name: "Remove teamleads",
        description: "Remove teamleaders from hosting list"
      }
    ]
  },
  misc: {
    scheduling: [
      {
        value: "schedule.hostsBalance",
        name: "View hosts balance",
        description: "Access to hosts balance tab"
      },
      {
        value: "schedule.TLBalance",
        name: "View teamleads balance",
        description: "Access to teamleads balance tab"
      }
    ],
    accounts: [
      {
        value: "accounts.create",
        name: "Create game accounts",
        description: "Create new game accounts"
      },
      {
        value: "accounts.view",
        name: "View game accounts",
        description: "View created accounts"
      },
      {
        value: "accounts.update",
        name: "Update game accounts",
        description: "Modify properties of an existing account",
        props: [
          {
            value: "accountsProps.login",
            name: "Login"
          },
          {
            value: "accountsProps.password",
            name: "Password"
          },
          {
            value: "accountsProps.presets",
            name: "Presets"
          },
          {
            value: "accountsProps.notes",
            name: "Notes"
          },
          {
            value: "accountsProps.claimedBy",
            name: "Claimed by"
          },
          {
            value: "accountsProps.locked",
            name: "Locked"
          }
        ]
      },
      {
        value: "accounts.delete",
        name: "Delete game accounts",
        description: "Delete existing game accounts"
      },
      {
        value: "accounts.claim",
        name: "Claim game accounts",
        description: "Ability to mark an account as used by user"
      },
      {
        value: "accounts.markAccess",
        name: "Mark access",
        description: "User can mark to which accounts they have access to"
      }
    ],
    codes: [
      {
        value: "codes.create",
        name: "Create codes",
        description: "Create new codes"
      },
      {
        value: "codes.view",
        name: "View codes",
        description: "View created codes"
      },
      {
        value: "codes.viewAnyAdminToken",
        name: "View admin tokens",
        description: "View any admin token even when not assigned to the code"
      },
      {
        value: "codes.update",
        name: "Update codes",
        description: "Modify properties of an existing code",
        props: [
          {
            value: "codesProps.expiration",
            name: "Expiration date"
          },
          {
            value: "codesProps.statsToken",
            name: "Stats token"
          },
          {
            value: "codesProps.adminToken",
            name: "Admin token"
          },
          {
            value: "codesProps.playerToken",
            name: "Player token"
          },
          {
            value: "codesProps.notes",
            name: "Notes"
          },
          {
            value: "codesProps.assignedUser",
            name: "Assigned user"
          }
        ]
      },
      {
        value: "codes.delete",
        name: "Delete codes",
        description: "Delete existing codes"
      }
    ],
    articles: [
      {
        value: "articles.create",
        name: "Create articles",
        description: "Create new articles"
      },
      {
        value: "articles.view",
        name: "View articles",
        description: "View created articles"
      },
      {
        value: "articles.update",
        name: "Update articles",
        description: "Modify properties of an existing article",
        props: [
          {
            value: "articlesProps.title",
            name: "Title"
          },
          {
            value: "articlesProps.contentShort",
            name: "Content short"
          },
          {
            value: "articlesProps.content",
            name: "Content"
          },
          {
            value: "articlesProps.previewImageURL",
            name: "Preview image URL"
          },
          {
            value: "articlesProps.category",
            name: "Category"
          }
        ]
      },
      {
        value: "articles.delete",
        name: "Delete articles",
        description: "Delete existing articles"
      }
    ]
  }
};
