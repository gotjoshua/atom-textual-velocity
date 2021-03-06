/* @flow */

const cfg = {
  path: {
    description: '_Changing this setting requires restarting the session._<br/>Path to folder where to find notes. Can be an absolute path or a relative path to `~/.atom` (defaults to `~/.atom/notes`)',
    type: 'string',
    default: '',
    title: '$PATH'
  },
  openpath: {
    description: '_When checked, tv will open add the note path as a project._(defaults to true)',
    type: 'boolean',
    default: true,
    title: 'Open Project in $PATH'
  },
  ignoredNames: {
    type: 'array',
    default: ['Notes & Settings'],
    items: {
      type: 'string'
    },
    description: 'List of [glob patterns](https://en.wikipedia.org/wiki/Glob_%28programming%29). Files matching these patterns will be ignored, in addition to the ignoredNames defined in core settings'
  },
  excludeVcsIgnoredPaths: {
    type: 'boolean',
    default: true,
    title: 'Exclude VCS Ignored Paths',
    description: 'Files ignored by the the notes path\'s VCS system will be ignored. For example, projects using Git have these paths defined in the .gitignore file.'
  },
  sortField: {
    default: 'name',
    type: 'string'
  },
  sortDirection: {
    type: 'string',
    default: 'desc',
    enum: [
      {value: 'asc', description: 'Ascending order'},
      {value: 'desc', description: 'Descending order'}
    ]
  },
  defaultExt: {
    title: 'Default file extension',
    description: 'Will be used for new files, unless the text string contains a custom file extension already',
    type: 'string',
    default: '.md'
  },
  listHeight: {
    description: 'Height of panel, can also be changed by dragging the bottom of panel',
    type: 'number',
    default: 150,
    minimum: 0
  },
  rowHeight: {
    description: 'Internal cached value, used to calculate pagination size',
    type: 'number',
    default: 20,
    minimum: 8,
    maximum: 80
  }
}

Object
  .keys(cfg)
  .forEach((key, i) => {
    const setting: Object = cfg[key]
    setting.order = i
  })

export default cfg
