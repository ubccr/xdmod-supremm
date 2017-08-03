# Open XDMoD SUPReMM Module

An available Open XDMoD enhancement is SUPReMM (integrated HPC systems usage and
performance of resources monitoring and modeling), which queries system hardware
counters to collect a range of performance information, including memory usage,
filesystem usage, interconnect fabric traffic, and CPU performance. Typically,
this information is acquired at the job’s start in the prolog, at the job’s end
in the epilog, and synchronously across all nodes periodically. The recommended
collection period is every 30 seconds. SUPReMM provides a large variety of job
performance metrics that give the HPC center directors and support personnel
insight into the performance of all applications running on the cluster, without
the need to recompile end user applications.

For more information, please visit
[the SUPReMM website](http://supremm.xdmod.org/supremm-overview.html).

## Installation

Prebuilt packages of the SUPReMM module are available as
[releases on GitHub](https://github.com/ubccr/xdmod-supremm/releases).

See [the installation instructions on the SUPReMM website](http://supremm.xdmod.org/supremm-install-overview.html)
for additional information.

## Support

Please email ccr-xdmod-help@buffalo.edu for support. Please
include the following in your email:

  - Open XDMoD version number and install type (RPM or tarball)
  - Operating system and version where Open XDMoD is installed
  - Description of the problem you are experiencing
  - Steps to reproduce the problem

## Contributing

Feedback is always welcome, and contributions are greatly appreciated!
Before getting started, please see
[our contributing guidelines](.github/CONTRIBUTING.md).

## Developing

See [the instructions for Open XDMoD](https://github.com/ubccr/xdmod#developing).

## Building

In addition to the dependencies required by Open XDMoD, the SUPReMM module
requires the following:

  - [Node.js](https://nodejs.org)
  - [npm](https://www.npmjs.com/)

See [the instructions for Open XDMoD](https://github.com/ubccr/xdmod#building).

## License

The Open XDMoD SUPReMM module is released under the GNU
Lesser General Public License ("LGPL") Version 3.0.  See the [LICENSE](LICENSE)
file for details.

The SUPReMM module uses several libraries that are licensed separately. See the
[license page on the SUPReMM website](http://supremm.xdmod.org/supremm-notices.html)
for details.
