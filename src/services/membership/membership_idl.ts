export type Membership = {
  version: '0.1.0';
  name: 'membership';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        { name: 'config'; isMut: true; isSigner: false },
        { name: 'treasury'; isMut: false; isSigner: false },
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'bronzePrice'; type: 'u64' },
        { name: 'silverPrice'; type: 'u64' },
        { name: 'goldPrice'; type: 'u64' },
      ];
    },
    {
      name: 'purchaseMembership';
      accounts: [
        { name: 'config'; isMut: true; isSigner: false },
        { name: 'membership'; isMut: true; isSigner: false },
        { name: 'membershipMint'; isMut: true; isSigner: false },
        { name: 'memberTokenAccount'; isMut: true; isSigner: false },
        { name: 'treasury'; isMut: true; isSigner: false },
        { name: 'member'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'associatedTokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'tier'; type: 'u8' },
        { name: 'nickname'; type: 'string' },
        { name: 'healthFocus'; type: { option: 'string' } },
      ];
    },
    {
      name: 'renewMembership';
      accounts: [
        { name: 'config'; isMut: true; isSigner: false },
        { name: 'membership'; isMut: true; isSigner: false },
        { name: 'treasury'; isMut: true; isSigner: false },
        { name: 'member'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
    {
      name: 'updateProfile';
      accounts: [
        { name: 'membership'; isMut: true; isSigner: false },
        { name: 'member'; isMut: false; isSigner: true },
      ];
      args: [
        { name: 'nickname'; type: { option: 'string' } },
        { name: 'healthFocus'; type: { option: 'string' } },
      ];
    },
  ];
  accounts: [
    {
      name: 'config';
      type: {
        kind: 'struct';
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'treasury'; type: 'publicKey' },
          { name: 'bronzePrice'; type: 'u64' },
          { name: 'silverPrice'; type: 'u64' },
          { name: 'goldPrice'; type: 'u64' },
          { name: 'initialized'; type: 'bool' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'membership';
      type: {
        kind: 'struct';
        fields: [
          { name: 'member'; type: 'publicKey' },
          { name: 'tier'; type: 'u8' },
          { name: 'nickname'; type: 'string' },
          { name: 'healthFocus'; type: 'string' },
          { name: 'purchasedAt'; type: 'i64' },
          { name: 'expiresAt'; type: 'i64' },
          { name: 'isActive'; type: 'bool' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
  ];
  events: [
    {
      name: 'ProgramInitialized';
      fields: [
        { name: 'authority'; type: 'publicKey'; index: false },
        { name: 'treasury'; type: 'publicKey'; index: false },
        { name: 'bronzePrice'; type: 'u64'; index: false },
        { name: 'silverPrice'; type: 'u64'; index: false },
        { name: 'goldPrice'; type: 'u64'; index: false },
      ];
    },
    {
      name: 'MembershipPurchased';
      fields: [
        { name: 'member'; type: 'publicKey'; index: false },
        { name: 'tier'; type: 'u8'; index: false },
        { name: 'nickname'; type: 'string'; index: false },
        { name: 'healthFocus'; type: { option: 'string' }; index: false },
        { name: 'price'; type: 'u64'; index: false },
      ];
    },
    {
      name: 'MembershipRenewed';
      fields: [
        { name: 'member'; type: 'publicKey'; index: false },
        { name: 'tier'; type: 'u8'; index: false },
        { name: 'newExpiration'; type: 'i64'; index: false },
      ];
    },
    {
      name: 'ProfileUpdated';
      fields: [
        { name: 'member'; type: 'publicKey'; index: false },
        { name: 'nickname'; type: 'string'; index: false },
        { name: 'healthFocus'; type: 'string'; index: false },
      ];
    },
  ];
  errors: [
    { code: 6000; name: 'InvalidNickname'; msg: 'Invalid nickname (must be 3-32 characters)' },
    { code: 6001; name: 'MembershipExpired'; msg: 'Membership expired' },
    { code: 6002; name: 'AlreadyMember'; msg: 'Already has active membership' },
    { code: 6003; name: 'InvalidTier'; msg: 'Invalid tier' },
  ];
};

export const IDL: Membership = {
  version: '0.1.0',
  name: 'membership',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'config', isMut: true, isSigner: false },
        { name: 'treasury', isMut: false, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'bronzePrice', type: 'u64' },
        { name: 'silverPrice', type: 'u64' },
        { name: 'goldPrice', type: 'u64' },
      ],
    },
    {
      name: 'purchaseMembership',
      accounts: [
        { name: 'config', isMut: true, isSigner: false },
        { name: 'membership', isMut: true, isSigner: false },
        { name: 'membershipMint', isMut: true, isSigner: false },
        { name: 'memberTokenAccount', isMut: true, isSigner: false },
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'member', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'rent', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'tier', type: 'u8' },
        { name: 'nickname', type: 'string' },
        { name: 'healthFocus', type: { option: 'string' } },
      ],
    },
    {
      name: 'renewMembership',
      accounts: [
        { name: 'config', isMut: true, isSigner: false },
        { name: 'membership', isMut: true, isSigner: false },
        { name: 'treasury', isMut: true, isSigner: false },
        { name: 'member', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'updateProfile',
      accounts: [
        { name: 'membership', isMut: true, isSigner: false },
        { name: 'member', isMut: false, isSigner: true },
      ],
      args: [
        { name: 'nickname', type: { option: 'string' } },
        { name: 'healthFocus', type: { option: 'string' } },
      ],
    },
  ],
  accounts: [
    {
      name: 'config',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'treasury', type: 'publicKey' },
          { name: 'bronzePrice', type: 'u64' },
          { name: 'silverPrice', type: 'u64' },
          { name: 'goldPrice', type: 'u64' },
          { name: 'initialized', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'membership',
      type: {
        kind: 'struct',
        fields: [
          { name: 'member', type: 'publicKey' },
          { name: 'tier', type: 'u8' },
          { name: 'nickname', type: 'string' },
          { name: 'healthFocus', type: 'string' },
          { name: 'purchasedAt', type: 'i64' },
          { name: 'expiresAt', type: 'i64' },
          { name: 'isActive', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  events: [
    {
      name: 'ProgramInitialized',
      fields: [
        { name: 'authority', type: 'publicKey', index: false },
        { name: 'treasury', type: 'publicKey', index: false },
        { name: 'bronzePrice', type: 'u64', index: false },
        { name: 'silverPrice', type: 'u64', index: false },
        { name: 'goldPrice', type: 'u64', index: false },
      ],
    },
    {
      name: 'MembershipPurchased',
      fields: [
        { name: 'member', type: 'publicKey', index: false },
        { name: 'tier', type: 'u8', index: false },
        { name: 'nickname', type: 'string', index: false },
        { name: 'healthFocus', type: { option: 'string' }, index: false },
        { name: 'price', type: 'u64', index: false },
      ],
    },
    {
      name: 'MembershipRenewed',
      fields: [
        { name: 'member', type: 'publicKey', index: false },
        { name: 'tier', type: 'u8', index: false },
        { name: 'newExpiration', type: 'i64', index: false },
      ],
    },
    {
      name: 'ProfileUpdated',
      fields: [
        { name: 'member', type: 'publicKey', index: false },
        { name: 'nickname', type: 'string', index: false },
        { name: 'healthFocus', type: 'string', index: false },
      ],
    },
  ],
  errors: [
    { code: 6000, name: 'InvalidNickname', msg: 'Invalid nickname (must be 3-32 characters)' },
    { code: 6001, name: 'MembershipExpired', msg: 'Membership expired' },
    { code: 6002, name: 'AlreadyMember', msg: 'Already has active membership' },
    { code: 6003, name: 'InvalidTier', msg: 'Invalid tier' },
  ],
};
