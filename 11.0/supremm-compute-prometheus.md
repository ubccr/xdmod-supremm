**These instructions only apply to resources that will use Prometheus software. Configuration instructions for PCP are [here](supremm-compute-pcp.html).**

This section gives example configuration settings for Prometheus
running on the compute nodes of an HPC cluster. These configuration
guidelines are based on the Prometheus collection setup at CCR Buffalo.

Prerequisites
-------------

The recommended exporters should be installed on every
compute node as described in the [install section](supremm-install-prometheus.html).

Configuration
-------------

After the exporters have been installed on each compute node,
Prometheus should be configured to scrape the endpoints provided by the exporters.
The following basic Prometheus configuration is the recommended
configuration for use with the summarization software.

**prometheus.yml**

    global:
      scrape_interval: 30s
      scrape_timeout: 30s

    scrape_configs:
      - file_sd_configs:
        - files:
          - "/etc/prometheus/file_sd/targets.json"
        job_name: compute
        relabel_configs:
        - regex: ([^.]+)..*
          replacement: $1
          source_labels:
          - __address__
          target_label: host

### Scrape Interval

The `scrape_interval` configuration sets the frequency at which Prometheus
scrapes metrics exposed by the exporters. It is recommended for Prometheus to
scrape exporters every 30 seconds, but this can vary depending on the number of nodes
being monitored and storage limitations.

### File-Based Service Discovery

Prometheus can be configured to automatically monitor or stop monitoring nodes
as they become available or unavailable. This is managed by the `file_sd_configs`
configuration. This configuration allows Prometheus to dynamically scrape nodes as
they become available without having to restart the Prometheus server. Prometheus
listens for changes to the files configured under `files` and automatically
scrapes those configured targets. An example `targets.json` is below:

**targets.json**

    [
      {
        "targets": [
          "cpn-01:9100",
          "cpn-01:9306",
          "cpn-02:9100",
          "cpn-02:9306",
          ...
        ],
        "labels": {
          "cluster": "resource_name",
          "environment": "production",
          "role": "compute"
        }
      }
    ]

One advantage to using file-based service discovery is that Prometheus can be
configured to add pre-defined labels to metrics scraped from groups of targets.
This can be set up across multiple clusters or environments like in the example.
More information about Prometheus's file-based service discovery can be found [here](https://prometheus.io/docs/guides/file-sd/).

### Relabeling

Prometheus can edit labels attached to metrics as they are scraped.
The relabeling configured under `relabel_configs` in `prometheus.yml` above converts the fqdn
returned by the default \_\_address\_\_ label into just the hostname labeled as "host".

**NOTE: The summarization software's default `prometheus/mapping.json` expects the
"\_\_address\_\_" to be relabeled as "host". The name of the target relabel must match the name
defined in the "params" section of the prometheus mapping file.**
