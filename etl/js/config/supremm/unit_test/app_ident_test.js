/* eslint-env es6 */
const path = require('path');

var appident = require('../app_ident.js')(path.resolve(__dirname, '../application.json'));

var testData = {
    amber: [
        'pmemd',
        'pmemd.cuda',
        'pmemd.cuda_DPFP',
        'pmemd.cuda_DPFP.MPI',
        'pmemd.cuda.MPI',
        'pmemd.cuda_SPFP',
        'pmemd.cuda_SPFP.MPI',
        'pmemd.cuda_SPX',
        'pmemd.cuda_SPXP.MPI',
        'pmemd.MPI'
    ],
    PROPRIETARY: [
        'l913.exe',
        'l607.exe',
        'l121.exe',
        'l602.exe',
        'l1602.exe',
        'l124.exe',
        'l702.exe',
        'l308.exe',
        'l914.exe',
        'l811.exe',
        'l103.exe',
        'l202.exe',
        'l303.exe',
        'l716.exe',
        'l402.exe',
        'l120.exe'
    ],
    raxml: [
        'raxmlHPC-HYBRID'
    ],
    beast2: [
        'beast2wrapper'
    ],
    beast: [
        'beast'
    ],
    neuron: [
        'nrniv'
    ],
    r: [
        'R'
    ]
};

Object.getOwnPropertyNames(testData).forEach(
    function (val) {
        for (let i = 0; i < testData[val].length; i++) {
            var identified = appident([testData[val][i]]);
            if (!identified || val !== identified.name) {
                process.stderr.write('Mismatch for ' + val + ' ' + JSON.stringify(identified) + '\n');
                process.exit(1);
            }
        }
    }
);


var tests = [
    {
        app: 'namd',
        execs: [
            '/opt/intel/compilers_and_libraries_2017.4.196/linux/mpi/intel64/bin/pmi_proxy',
            '/bin/sh',
            'tee',
            '/bin/csh',
            'namd2',
            'mpiexec.hydra',
            '/opt/packages/slurm/17.02.5/bin/srun'
        ]
    },
    {
        app: 'tophat',
        execs: [
            'gzip',
            '/bin/bash',
            'python',
            '/opt/packages/tophat/2.1.0/bin/prep_reads'
        ]
    },
    {
        app: 'satsuma2',
        execs: [
            '/project/programs/satsuma2/bin/KMatch',
            'sh',
            '/projects/programs/satsuma2/bin/MergeXCorrMatches',
            '/bin/bash',
            '/projects/programs/satsuma2/bin/SatsumaSynteny2',
            '/projects/programs/satsuma2/bin/HomologyByXCorrSlave'
        ]
    },
    {
        app: 'lammps',
        execs: [
            'lmp_mpi',
            'mpispawn',
            'mpirun_rsh',
            'slurm_script',
            'perl'
        ]
    }
];

var blastExecs = [
    'blastn',
    '/opt/apps/blast/2.2.27/bin/blastp',
    '/opt/apps/blast/2.2.28/bin/blastp',
    '/work/00000/redacted/ncbi-blast-2.2.29+/blast',
    '/opt/apps/blast/2.2.28/bin/blastx',
    'blastp',
    'tblastp',
    'blastpgp',
    'rpsblast',
    'psiblast',
    'blastx',
    'blastdbcmd',
    'blastall',
    '/pylon2/xxxxx/redacted/1-13/GeneQC_human_1/blast/bin/blastn',
    '/opt/packages/blast/2.6.0/bin/blastn',
    '/opt/GOMAP/data/software/blast-2.6.0+/bin/blastp'
];

for (let i = 0; i < blastExecs.length; i++) {
    tests.push({
        app: 'ncbi-blast',
        execs: [
            blastExecs[i]
        ]
    });
}

for (let i = 0; i < tests.length; i++) {
    let test = tests[i];
    var identified = appident(test.execs);
    if (!identified || test.app !== identified.realname) {
        process.stderr.write('Mismatch for ' + JSON.stringify(test) + ' ' + JSON.stringify(identified) + '\n');
        process.exit(1);
    }
}

var app = appident(['qwjeqwklejqkeljqwkwjeklqj;LQNWEL;FN;AWEFWKEL', 'QWEQWEQ', 'SDFjlasdfjklgfjglkjg']);
if (app) {
    process.stderr.write('Misclassified app ' + JSON.stringify(app));
    process.exit(1);
}
