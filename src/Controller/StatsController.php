<?php

namespace CCR\Controller;

use \Symfony\Component\HttpFoundation\Request;
use \Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

class StatsController extends BaseController
{

    #[Route('{prefix}internal_dashboard/stats.php', requirements: ['prefix' => '.*'], methods: ['GET'])]
    public function getStats(Request $request): Response
    {
        $user = $this->authorize($request);

        $params = [
            'extjs_path' => 'gui/lib',
            'extjs_version' => 'extjs',
            'rest_token' => $user->getToken(),
            'rest_url' => sprintf(
                '%s%s',
                \xd_utilities\getConfiguration('rest', 'base'),
                \xd_utilities\getConfiguration('rest', 'version')
            )
        ];

        return $this->render('twig/stats.html.twig', $params);
    }
}
