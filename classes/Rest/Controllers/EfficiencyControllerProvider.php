<?php

namespace Rest\Controllers;

use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Silex\ControllerCollection;
use \Symfony\Component\HttpFoundation\JsonResponse;

use XDUser;
use \CCR\DB;

class EfficiencyControllerProvider extends BaseControllerProvider
{
    /**
     * This function is responsible for the setting up of any routes that this
     * ControllerProvider is going to be managing. It *must* be overridden by
     * a child class.
     *
     * @param Application $app
     * @param ControllerCollection $controller
     * @return null
     */
    public function setupRoutes(Application $app, ControllerCollection $controller)
    {
        $root = $this->prefix;
        $base = get_class($this);

        // QUERY ROUTES
        /**
        * @OA\Get(
        *   path="/analytics",
        *   summary="analytic list",
        *   @OA\Response(
        *     response=200,
        *     description="Returns a json object of analytics to be displayed in the efficiency tab."
        *   ),
        *   @OA\Response(
        *     response="default",
        *     description="An error occurred while retrieving analytics."
        *   )
        * )
        */
        $controller->get("$root/analytics", "$base::getAnalytics");
    }

     /**
     * Retrieve efficiency analytics
     *
     * @param Request $request
     * @param Application $app
     * @return JsonResponse
     */
    public function getAnalytics(Request $request, Application $app)
    {
        $user = $this->authorize($request);

        $efficiencyAnalytics = \Configuration\XdmodConfiguration::assocArrayFactory(
            'efficiency_analytics.json',
            CONFIG_DIR,
            null
        );

        return $app->json(array(
            'success' => true,
            'total' => count($efficiencyAnalytics),
            'data' => array_values($efficiencyAnalytics)
        ));
    }
} 
