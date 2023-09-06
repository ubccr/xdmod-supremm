**These instructions only apply to resources that will use Prometheus. Installation instructions for PCP software can be found [here](supremm-install-pcp.html).**

Prometheus exporters should be installed on each compute node and configured so
that metrics are scraped periodically during the job (recommended 30 seconds)

Data for each node are scraped by Prometheus and stored in Prometheus's
timeseries database for subsequent processing by the job summarization software.

Install Prometheus
------------------

The official installation instructions for Prometheus are [here](https://prometheus.io/docs/prometheus/latest/installation/).
The summarization software has been tested against Prometheus 2.3.0. Other versions are available from the
[official Prometheus dowload page](https://prometheus.io/download/).

For a source code install follow the instructions on the [official Prometheus repo](https://github.com/prometheus/prometheus).

Install the exporters on the compute nodes
-------------------------------------------

The summarization software utilizes metrics from the following exporters:
* [Node Exporter](https://github.com/prometheus/node_exporter)
* [Cgroup Exporter](https://github.com/treydock/cgroup_exporter)
* [IPMI Exporter](https://github.com/prometheus-community/ipmi_exporter)
* [DCGM Exporter](https://github.com/NVIDIA/dcgm-exporter)

The following metrics are disabled by default for the Node Exporter and must be enabled for some plugins:
* NUMA Node Metrics: `--collector.meminfo.numa`
* CPU info: `--collector.cpu.info`
* NFSv4 Metrics: `--collector.mountstats`

The summarization software will still function without these flags enabled, however some plugins will not run without these flags set.

Note that the node that runs the summarization software does not need to have Prometheus or the exporters installed.

Compatibility notes
-------------------

The summarization software is tested on Rocky 8 with the following software versions:
* Prometheus: [v2.3.0](https://github.com/prometheus/prometheus/releases/tag/v2.30.0)
* Node Exporter: [v1.2.1](https://github.com/prometheus/node_exporter/releases/tag/v1.2.1)
* IPMI Exporter: [v1.4.0](https://github.com/prometheus-community/ipmi_exporter/releases/tag/v1.4.0)
* DCGM Exporter: [v2.3.1](https://github.com/NVIDIA/dcgm-exporter/releases/tag/2.3.5-2.6.5)
* CGroup Exporter: [v0.7.0](https://github.com/treydock/cgroup_exporter/releases/tag/v0.7.0)

Newer versions of the software might be compatible with the summarization software but have not been fully tested.
