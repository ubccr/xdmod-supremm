**These instructions only apply to resources that will use Prometheus. Usage instructions for PCP be found [here](supremm-pcp-use.html).**

The following describes how to query Prometheus and verify
that metrics are being scraped properly.

Prerequisites
-------------
Prometheus and the necessary exporters should be [installed](supremm-install-prometheus.html)
and [configured](supremm-compute-prometheus.html) before continuing.

Start Prometheus
----------------

    # systemctl enable prometheus
    # systemctl start prometheus

Check the status of the Prometheus Server
-----------------------------------------
The following query checks for the build info of a Prometheus server
running on localhost port 9090 (default).

    # curl http://localhost:9090/api/v1/status/buildinfo | jq
    {
      "status": "success",
      "data": {
        "version": "2.30.0",
        "revision": "37468d88dce85ac507f3fb7864c7d1c078e3e27d",
        "branch": "HEAD",
        "buildUser": "user@host",
        "buildDate": "20210914-09:49:24",
        "goVersion": "go1.17.1"
      }
    }

If this query does not work, refer back to the installation
and configuration sections for more information.

Check that targets are being scraped
------------------------------------
The following query checks for a metric being scraped by Prometheus.
Depending on the number of nodes being scraped, this query may produce a lot of output.

    # curl http://localhost:9090/api/v1/query?query=node_cpu_seconds_total | jq
    {
      "status": "success",
      "data": {
        "resultType": "vector",
        "result": [
          {
            "metric": {
              "__name__": "node_cpu_seconds_total",
              "cluster": "prom",
              "cpu": "0",
              "environment": "dev",
              "host": "cpn-01",
              "instance": "cpn-01:9100",
              "job": "compute",
              "mode": "idle",
              "role": "compute"
            },
            "value": [
              1694008748.671,
              "42106739.42"
            ]
          },
          {
            "metric": {
              "__name__": "node_cpu_seconds_total",
              "cluster": "prom",
              "cpu": "0",
              "environment": "dev",
              "host": "cpn-01",
              "instance": "cpn-01:9100",
              "job": "compute",
              "mode": "iowait",
              "role": "compute"
            },
            "value": [
              1694008748.671,
              "40038.05"
            ]
          }
          ...
        ]
      }
    }

