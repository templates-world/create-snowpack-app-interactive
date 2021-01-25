# create-snowpack-app-interactive

A CLI to generate a new [Snowpack](https://www.snowpack.dev) project. It allows you to customize all your project.

## Features

 * Usage of official and community [Snowpack](https://www.snowpack.dev) templates
 * Support for official and community [Snowpack](https://www.snowpack.dev) plugins
 * Support for [Capacitor](https://capacitorjs.com) to create Android or IOS apps (coming later)
 * Support for PWA (coming later)
 * Support for WebWorkers (coming later)

## Install

**Npm:** ``npm i -g create-snowpack-app-interactive``

**Yarn:** ``yarn global add create-snowpack-app-interactive``

### Android (Still experimental)

If you want to use the Android part:

 1. Download command line tools from the [official Android download page](https://developer.android.com/studio#downloads)
 2. Create a directory ``$root/Android/cmdline-tools/latest`` at the root of your disk (e.g for Windows ``C:/``)
 3. Drop the downloaded tools inside the created folder.
    * If Windows, add ``$root/Android/cmdline-tools/latest/bin`` to your PATH variable
    * If Linux (or Mac I guess) run ``export PATH="$root/Android/cmdline-tools/latest/bin:$PATH"`` in your terminal
 4. You can continue to follow instructions [here](https://guides.codepath.com/android/installing-android-sdk-tools#:~:text=%2F-,Installing%20the%20Android%20SDK%20(Manual%20Way),for%20your%20build%20machine%20OS.).

## Usage

Simply run ``create-snowpack-app-interactive`` (or ``csai``) to start the skeleton. You can define directly the name of your project by using ``create-snowpack-app-interactive your-project``.

## Buy me a ko-fi

Whether you use this project, have learned something from it, or just like it, please consider supporting it by buying me a coffee, so I can dedicate more time on open-source projects like this 😉 (personally I prefer hot chocolate but whatever)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/olyno)

## License

Code released under GNU GPLv3 license.

Copyright ©, [Olyno](https://github.com/Olyno).