<?php

namespace TestHelpers\mock;

/* Unfortunately, the JobMetadata class was not designed to be testable
* so this workaround is a necessary evil.
*/
class JobMetadataWorkaround extends \DataWarehouse\Query\SUPREMM\JobMetadata
{
    public function __construct() {
    }
}
