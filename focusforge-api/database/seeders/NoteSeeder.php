<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@test.com')->first();

        if (! $user) {
            return;
        }

        $notes = [
            [
                'title'   => 'The Pomodoro Technique',
                'content' => "The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into focused intervals, traditionally 25 minutes in length, separated by short breaks.\n\nHow it works:\n1. Choose a task to work on.\n2. Set a timer for 25 minutes (one \"Pomodoro\").\n3. Work on the task until the timer rings.\n4. Take a 5-minute short break.\n5. Every 4 Pomodoros, take a longer break of 15–30 minutes.\n\nBenefits:\n- Reduces the impact of internal and external interruptions on focus.\n- Increases accountability and helps estimate how long tasks take.\n- Combats the anxiety of open-ended work by creating clear time blocks.\n- Helps prevent mental fatigue through structured rest.\n\nThe technique is especially useful for students and knowledge workers who face large, complex tasks. By breaking work into small, manageable chunks, it makes starting easier and momentum naturally builds.\n\nCommon variations include longer Pomodoros (50 min / 10 min break) for deep work tasks that require more ramp-up time. Some practitioners also track completed Pomodoros as a productivity metric.",
            ],
            [
                'title'   => 'Introduction to Calculus: Derivatives',
                'content' => "Calculus is the mathematical study of continuous change. It has two major branches: differential calculus and integral calculus.\n\nDerivatives:\nA derivative measures how a function changes as its input changes. Formally, the derivative of f(x) is:\nf'(x) = lim(h→0) [f(x+h) - f(x)] / h\n\nBasic Derivative Rules:\n1. Power Rule: d/dx [x^n] = n * x^(n-1)\n   Example: d/dx [x^3] = 3x^2\n\n2. Constant Rule: d/dx [c] = 0\n\n3. Sum Rule: d/dx [f(x) + g(x)] = f'(x) + g'(x)\n\n4. Product Rule: d/dx [f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x)\n\n5. Chain Rule: d/dx [f(g(x))] = f'(g(x)) · g'(x)\n\nApplications:\n- Finding the slope of a curve at any point\n- Determining maximum and minimum values of functions\n- Calculating velocity and acceleration (derivatives of position)\n- Optimization problems in economics and engineering\n\nCritical Points:\nA critical point occurs where f'(x) = 0 or f'(x) is undefined. These are candidates for local maxima, minima, or saddle points. Use the second derivative test: if f''(x) > 0, the point is a local minimum; if f''(x) < 0, it is a local maximum.",
            ],
            [
                'title'   => 'World War II: Key Causes and Events',
                'content' => "World War II (1939–1945) was the deadliest conflict in human history, involving more than 30 countries and resulting in 70–85 million deaths.\n\nMajor Causes:\n1. Rise of Fascism: Nationalist and fascist movements rose in Germany (Nazism under Hitler), Italy (Mussolini), and Japan.\n2. Treaty of Versailles (1919): Harsh reparations imposed on Germany after WWI created economic hardship and political resentment.\n3. Great Depression: The global economic collapse of the 1930s destabilized governments and fueled extremist politics.\n4. Policy of Appeasement: Britain and France allowed Hitler to annex territories (e.g., Austria, Sudetenland) hoping to avoid war.\n5. Failure of the League of Nations: The international body lacked enforcement power and the US never joined.\n\nKey Events:\n- September 1, 1939: Germany invades Poland; Britain and France declare war on Germany.\n- June 1940: Fall of France; Germany occupies Paris.\n- July–October 1940: Battle of Britain — RAF defeats Luftwaffe air campaign.\n- June 22, 1941: Operation Barbarossa — Germany invades the Soviet Union.\n- December 7, 1941: Japan attacks Pearl Harbor; US enters the war.\n- June 6, 1944 (D-Day): Allied forces land at Normandy, France.\n- May 8, 1945 (V-E Day): Germany surrenders.\n- August 6 & 9, 1945: US drops atomic bombs on Hiroshima and Nagasaki.\n- September 2, 1945 (V-J Day): Japan surrenders, ending WWII.\n\nLegacy: The war led to the creation of the United Nations, the beginning of the Cold War, decolonization movements, and the Nuremberg Trials establishing international war crimes law.",
            ],
            [
                'title'   => 'Photosynthesis: How Plants Make Food',
                'content' => "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored as glucose.\n\nOverall Equation:\n6CO2 + 6H2O + light energy → C6H12O6 + 6O2\n(Carbon dioxide + water + light → glucose + oxygen)\n\nTwo Stages of Photosynthesis:\n\n1. Light-Dependent Reactions (occur in the thylakoid membrane):\n- Chlorophyll absorbs sunlight (primarily red and blue wavelengths).\n- Water molecules are split (photolysis), releasing oxygen as a byproduct.\n- ATP and NADPH are produced — these are energy carriers.\n- The light reactions convert light energy into chemical energy.\n\n2. Calvin Cycle / Light-Independent Reactions (occur in the stroma):\n- CO2 from the atmosphere is fixed (attached) to a 5-carbon molecule (RuBP).\n- Using ATP and NADPH from the light reactions, glucose is synthesized.\n- The enzyme RuBisCO catalyzes the first major step.\n\nFactors Affecting Photosynthesis:\n- Light intensity: More light = faster rate (up to a saturation point)\n- CO2 concentration: Higher CO2 = faster rate\n- Temperature: Optimal range 25–35°C; enzymes denature at high temps\n- Water availability: Water stress closes stomata, limiting CO2 intake\n\nImportance:\n- Produces the oxygen we breathe\n- Forms the base of almost all food chains\n- Removes CO2 from the atmosphere, regulating climate",
            ],
            [
                'title'   => 'Basics of Object-Oriented Programming (OOP)',
                'content' => "Object-Oriented Programming (OOP) is a programming paradigm that organizes software design around data (objects) rather than functions and logic.\n\nFour Core Principles:\n\n1. Encapsulation\nBundling data (attributes) and methods (functions) that operate on the data into a single unit called a class. Access modifiers (public, private, protected) control visibility.\nExample: A BankAccount class holds balance privately and exposes deposit() and withdraw() methods.\n\n2. Abstraction\nHiding complex implementation details and showing only essential features. Achieved through abstract classes and interfaces.\nExample: A Car class exposes drive() without revealing engine internals.\n\n3. Inheritance\nA class (child/subclass) can inherit attributes and methods from another class (parent/superclass), promoting code reuse.\nExample: class Dog extends Animal — Dog inherits eat() and sleep() from Animal.\n\n4. Polymorphism\nObjects of different classes can be treated as objects of a common superclass. Methods can behave differently based on the object calling them.\nExample: shape.draw() behaves differently for Circle, Square, and Triangle objects.\n\nKey Concepts:\n- Class: Blueprint for creating objects\n- Object: Instance of a class\n- Constructor: Special method called when an object is created\n- Method Overriding: Child class provides a specific implementation of a parent method\n- Interface: Contract that classes must implement\n\nBenefits of OOP:\n- Modularity: Code is organized into self-contained objects\n- Reusability: Inheritance reduces code duplication\n- Maintainability: Easier to update and debug\n- Scalability: New features can be added with minimal changes to existing code",
            ],
        ];

        foreach ($notes as $note) {
            $wordCount = str_word_count(strip_tags($note['content']));
            Note::create([
                'user_id'    => $user->id,
                'title'      => $note['title'],
                'content'    => $note['content'],
                'word_count' => $wordCount,
            ]);
        }

        $this->command->info('Created ' . count($notes) . ' sample notes for ' . $user->email);
    }
}
