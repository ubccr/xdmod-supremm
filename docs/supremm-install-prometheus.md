**These instructions only apply to resources that will use Prometheus. Installation instructions for PCP software can be found [here](supremm-install-pcp.html).**

Prometheus exporters should be installed on each compute node and configured so
that metrics are scraped periodically during the job (recommended 30 seconds)

Data for each node are scraped by Prometheus and stored in Prometheus's
timeseries database for subsequent processing by the job summarization software.

Install Prometheus
------------------

The official installation instructions for Prometheus are [here](https://prometheus.io/docs/prometheus/latest/installation/).
The summarization software has been tested against Prometheus 2.3.0. Other versions are available from the
[official Prometheus download page](https://prometheus.io/download/).

For a source code install follow the instructions on the [official Prometheus repo](https://github.com/prometheus/prometheus).

Install the exporters on the compute nodes
-------------------------------------------

The summarization software utilizes metrics from the following exporters:
* [Node Exporter](https://github.com/prometheus/node_exporter)
* [Cgroup Exporter](https://github.com/treydock/cgroup_exporter)
* [IPMI Exporter](https://github.com/prometheus-community/ipmi_exporter)
* [DCGM Exporter](https://github.com/NVIDIA/dcgm-exporter)

After installation, it is recommended to configure the exporters as services managed
by systemd. An example configuration for an exporter service file running under the
`prometheus` user is as follows:

**/usr/lib/systemd/system/example\_exporter.service**

    [Unit]
    Description=EXAMPLE_EXPORTER
    After=network.target

    [Service]
    EnvironmentFile=-/etc/default/EXAMPLE_EXPORTER
    User=prometheus
    ExecStart=/usr/bin/ $EXAMPLE_EXPORTER_OPTS
    Restart=on-failure
    RestartSec=5s

    [Install]
    WantedBy=multi-user.target

**/etc/default/example\_exporter**

    EXAMPLE_EXPORTER_OPTS='--flag1 --flag2'

The following flags are disabled by default for the exporters and must be enabled for some plugins. Append the following flags to the corresponding exporter environment files:

**Node Exporter** (`/etc/default/node_exporter`)

    NODE_EXPORTER_OPS=`--collector.cpu.info`

**CGroup Exporter** (`/etc/default/cgroup_exporter`)

    CGROUP_EXPORTER_OPTS="--config.paths=/slurm --collect.proc"

If the CGroup Exporter is not running as the root user, then run the following command to ensure the user running
the exporter can read everything under procfs:

    setcap cap_sys_ptrace=eip /usr/bin/cgroup_exporter

The summarization software will still function without these flags enabled, however some plugins will not run without it set.

Metrics are exposed under the `/metrics` endpoint for each exporter. Ensure each exporter is properly exporting metrics with `curl`
like the following example for the Node Exporter:

    $ curl http://localhost:9100/metrics
    # HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
    # TYPE go_gc_duration_seconds summary
    go_gc_duration_seconds{quantile="0"} 2.6369e-05
    go_gc_duration_seconds{quantile="0.25"} 5.1473e-05
    go_gc_duration_seconds{quantile="0.5"} 5.5654e-05
    go_gc_duration_seconds{quantile="0.75"} 5.8111e-05
    go_gc_duration_seconds{quantile="1"} 0.000120961
    go_gc_duration_seconds_sum 148.050290784
    go_gc_duration_seconds_count 840389
    # HELP go_goroutines Number of goroutines that currently exist.
    # TYPE go_goroutines gauge
    go_goroutines 8
    # HELP go_info Information about the Go environment.
    # TYPE go_info gauge
    go_info{version="go1.16.7"} 1

The default ports for each exporter are:

* Node Exporter: 9100
* CGroup Exporter: 9306
* IPMI Exporter: 9290
* DCGM Exporter: 9400

Note that the node that runs the summarization software does not need to have Prometheus or the exporters installed.

Compatibility notes
-------------------

Version {{ page.summ_sw_version }} of the summarization software is tested on Rocky 8 with the following software versions:
* Prometheus: [v2.3.0](https://github.com/prometheus/prometheus/releases/tag/v2.30.0)
* Node Exporter: [v1.2.1](https://github.com/prometheus/node_exporter/releases/tag/v1.2.1)
* IPMI Exporter: [v1.4.0](https://github.com/prometheus-community/ipmi_exporter/releases/tag/v1.4.0)
* DCGM Exporter: [v2.3.1](https://github.com/NVIDIA/dcgm-exporter/releases/tag/2.3.5-2.6.5)
* CGroup Exporter: [v0.7.0](https://github.com/treydock/cgroup_exporter/releases/tag/v0.7.0)

Newer versions of these software might be compatible with the summarization software but have not been fully tested.
