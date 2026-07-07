export const competition = {
  name: 'competition',
  title: 'Competition',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Robotika', value: 'robotika' },
          { title: 'Paper', value: 'paper' },
          { title: 'Hackathon', value: 'hackathon' },
          { title: 'Lainnya', value: 'other' },
        ],
      },
    },
    {
      name: 'registrationType',
      title: 'Registration Type',
      type: 'string',
      initialValue: 'team',
      options: {
        list: [
          { title: 'Individual', value: 'individual' },
          { title: 'Team', value: 'team' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'teamUidPrefix',
      title: 'Team UID Prefix',
      type: 'string',
      description: 'Required for team competitions, for example RBT or HCK.',
      hidden: ({ parent }: any) => parent?.registrationType !== 'team',
    },
    {
      name: 'teamMin',
      title: 'Min Team Size',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'teamMax',
      title: 'Max Team Size',
      type: 'number',
      initialValue: 5,
    },
    {
      name: 'regOpen',
      title: 'Registration Opens',
      type: 'datetime',
    },
    {
      name: 'regClose',
      title: 'Registration Closes',
      type: 'datetime',
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'guideBook',
      title: 'Guide Book (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
    },
  ],
}
