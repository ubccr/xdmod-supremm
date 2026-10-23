<?php

namespace CCR\Controller;

use CCR\Security\Attributes\MgrRequired;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Routing\Attribute\Route;

class StatsController extends BaseController
{
    #[MgrRequired]
    #[Route('{prefix}internal_dashboard/stats.php', requirements: ['prefix' => '.*'], methods: ['GET'])]
    public function getStats(Request $request): Response
    {
        $params = [
            'extjs_path' => 'gui/lib',
            'extjs_version' => 'extjs',
        ];

        return $this->render('supremm/twig/stats.html.twig', $params);
    }
}
