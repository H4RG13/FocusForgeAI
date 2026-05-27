<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'title'       => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'status'      => fake()->randomElement(['todo', 'in_progress', 'done']),
            'priority'    => fake()->randomElement(['low', 'medium', 'high']),
            'due_date'    => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }
}
