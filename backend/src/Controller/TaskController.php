<?php
namespace App\Controller;
use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/tasks', name: 'api_tasks_')]
class TaskController extends AbstractController
{
    // Afficher toutes les tâches
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(TaskRepository $repository): JsonResponse
    {
        $tasks = $repository->findBy([], ['createdAt' => 'DESC']);

        $data = [];

        foreach ($tasks as $task) {
            $data[] = $this->formatTask($task);
        }

        return $this->json($data);
    }

    // Afficher une tâche
    #[Route('/{id}', name: 'show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id, TaskRepository $repository): JsonResponse
    {
        $task = $repository->find($id);

        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable'], 404);
        }

        return $this->json($this->formatTask($task));
    }

    // Ajouter une tâche
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty(trim($data['title'] ?? ''))) {
            return $this->json(['error' => 'Le titre est obligatoire'], 400);
        }

        $task = new Task();
        $task->setTitle(trim($data['title']));
        $task->setDescription($data['description'] ?? null);

        $em->persist($task);
        $em->flush();

        return $this->json($this->formatTask($task), 201);
    }

    // Modifier une tâche
    #[Route('/{id}', name: 'update', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        TaskRepository $repository,
        EntityManagerInterface $em
    ): JsonResponse {
        $task = $repository->find($id);

        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        if (isset($data['title'])) {
            if (!is_string($data['title']) || trim($data['title']) === '') {
                return $this->json(['error' => 'Titre invalide'], 400);
            }

            $task->setTitle(trim($data['title']));
        }

        if (array_key_exists('description', $data)) {
            $task->setDescription($data['description']);
        }

        if (isset($data['isCompleted'])) {
            $task->setIsCompleted((bool) $data['isCompleted']);
        }

        $em->flush();

        return $this->json($this->formatTask($task));
    }

    // Supprimer une tâche
    #[Route('/{id}', name: 'delete', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function delete(
        int $id,
        TaskRepository $repository,
        EntityManagerInterface $em
    ): JsonResponse {
        $task = $repository->find($id);

        if (!$task) {
            return $this->json(['error' => 'Tâche introuvable'], 404);
        }

        $em->remove($task);
        $em->flush();

        return $this->json(['message' => 'Tâche supprimée']);
    }

    private function formatTask(Task $task): array
    {
        return [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'isCompleted' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}
