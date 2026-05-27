<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        ['user' => $user, 'token' => $token] = $this->authService->register($request->validated());

        return response()->json([
            'data'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        ['user' => $user, 'token' => $token] = $this->authService->login(
            $request->email,
            $request->password,
        );

        return response()->json([
            'data'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => new UserResource($request->user())]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                     => ['sometimes', 'string', 'max:255'],
            'timezone'                 => ['sometimes', 'string', 'timezone'],
            'daily_focus_goal_minutes' => ['sometimes', 'integer', 'min:15', 'max:720'],
        ]);

        $user = $this->authService->updateProfile($request->user(), $validated);

        return response()->json(['data' => new UserResource($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Successfully logged out.']);
    }
}
