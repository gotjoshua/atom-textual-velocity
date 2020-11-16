# Textual Velocity

**Archive notice:**

🌅  As of Nov 2020 I am actively migrating away from this project to using [Org Mode](http://orgmode.org/) instead. The project and repository will be archived soon thereafter to reflect this.

It has been a good run of ~5 years building and using this myself! I hope you have found it as useful as me during this time. Alas, I have outgrown my own project and decided to continue on a more standardized platform going forward. 

That said, I am not satisfied with any of the existing options out there (Org Mode included) and still contemplating alternatives. I intend to build something better, someday, but don't have the time and energy right now. Time will tell.

Thanks.

---

Your mental notes at your fingertips!

For those of you who used [Notational Velocity](http://notational.net/) or [nvAlt](http://brettterpstra.com/projects/nvAlt/) should feel right at home: it's intended to be an alternative to those applications but with the benefits of the [Atom](https://atom.io/) ecosystem.

<img width="748" alt="screen shot 2016-02-04 at 20 05 58" src="https://cloud.githubusercontent.com/assets/978461/12831123/f48a5964-cb92-11e5-9752-859edd2ed3a9.png">

Caveats:
 - Still WIP, see the [change log](CHANGELOG.md) for what's been done so far, and [v1 roadmap milestone](https://github.com/viddo/atom-textual-velocity/milestones) for planned/upcoming features.
 - Developed and tested on MacOSX, it _should_ work fine on Linux and Windows too but there's no guarantees right now. Help is appreciated!
 - Due to Atom's purpose of being a _text_-editor only text files are intended to be supported, compared to the single-database option NV offers.

## Usage
Use the `Textual Velocity: Start Session` [command](https://atom.io/docs/v1.4.3/getting-started-atom-basics#command-palette) to get started, the package is lazy loaded.

By default notes are saved in `~/.atom/notes`, you can change it in the package settings.

While the plugin can be run in any Atom window it's recommended to run it in a [separate instance for easier usage and access to your notes](docs/recommended-usage/README.md)

Also, I recommend the following packages, that works great in combination with textual-velocity:
- [quick-file-actions](https://atom.io/packages/quick-file-actions) - Quickly copy, delete, move, and create new files
- [file-icons](https://atom.io/packages/file-icons) - Assign file extension icons and colours for improved visual grepping
- [preview](https://atom.io/packages/preview) - Ultimate previewer of source code in Atom.
- [recent-files-fuzzy-finder](https://atom.io/packages/recent-files-fuzzy-finder) - Find recently opened files easier
- [block-travel](https://atom.io/packages/block-travel) - Quickly travel up/down between blocks of code
