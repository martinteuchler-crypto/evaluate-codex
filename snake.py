import pygame
import random

print("Run with: pip install pygame && python snake.py")


CELL_SIZE = 20
WIDTH, HEIGHT = 640, 480
GRID_WIDTH = WIDTH // CELL_SIZE
GRID_HEIGHT = HEIGHT // CELL_SIZE


class SnakeGame:
    def __init__(self):
        pygame.display.set_caption("Snake")
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("Arial", 24)
        self.big_font = pygame.font.SysFont("Arial", 48)
        self.running = True
        self.reset()

    def reset(self):
        self.snake = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = (1, 0)
        self.pending_direction = self.direction
        self.spawn_food()
        self.score = 0
        self.speed = 10
        self.state = "RUNNING"

    def spawn_food(self):
        while True:
            position = (
                random.randint(0, GRID_WIDTH - 1),
                random.randint(0, GRID_HEIGHT - 1),
            )
            if position not in self.snake:
                self.food = position
                break

    def handle_key(self, key):
        if self.state == "GAME_OVER":
            if key == pygame.K_r:
                self.reset()
            elif key == pygame.K_q:
                self.running = False
            return

        if key == pygame.K_p:
            if self.state == "RUNNING":
                self.state = "PAUSED"
            elif self.state == "PAUSED":
                self.state = "RUNNING"
            return

        if self.state != "RUNNING":
            return

        if key == pygame.K_UP and self.direction != (0, 1):
            self.pending_direction = (0, -1)
        elif key == pygame.K_DOWN and self.direction != (0, -1):
            self.pending_direction = (0, 1)
        elif key == pygame.K_LEFT and self.direction != (1, 0):
            self.pending_direction = (-1, 0)
        elif key == pygame.K_RIGHT and self.direction != (-1, 0):
            self.pending_direction = (1, 0)

    def update(self):
        if self.state != "RUNNING":
            return

        self.direction = self.pending_direction
        head_x, head_y = self.snake[0]
        new_head = (head_x + self.direction[0], head_y + self.direction[1])

        if (
            new_head[0] < 0
            or new_head[0] >= GRID_WIDTH
            or new_head[1] < 0
            or new_head[1] >= GRID_HEIGHT
            or new_head in self.snake
        ):
            self.state = "GAME_OVER"
            return

        self.snake.insert(0, new_head)
        if new_head == self.food:
            self.score += 1
            if self.score % 5 == 0:
                self.speed += 1
            self.spawn_food()
        else:
            self.snake.pop()

    def draw(self):
        self.screen.fill((0, 0, 0))

        for x, y in self.snake:
            rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(self.screen, (0, 255, 0), rect)

        fx, fy = self.food
        food_rect = pygame.Rect(fx * CELL_SIZE, fy * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        pygame.draw.rect(self.screen, (255, 0, 0), food_rect)

        score_surf = self.font.render(f"Score: {self.score}", True, (255, 255, 255))
        self.screen.blit(score_surf, (10, 10))

        if self.state == "PAUSED":
            pause_surf = self.big_font.render("Paused", True, (255, 255, 255))
            rect = pause_surf.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            self.screen.blit(pause_surf, rect)

        if self.state == "GAME_OVER":
            over_surf = self.big_font.render("Game Over", True, (255, 255, 255))
            over_rect = over_surf.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 50))
            self.screen.blit(over_surf, over_rect)

            final_surf = self.font.render(
                f"Final Score: {self.score}", True, (255, 255, 255)
            )
            final_rect = final_surf.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            self.screen.blit(final_surf, final_rect)

            inst_surf = self.font.render(
                "R = restart, Q = quit", True, (255, 255, 255)
            )
            inst_rect = inst_surf.get_rect(center=(WIDTH // 2, HEIGHT // 2 + 40))
            self.screen.blit(inst_surf, inst_rect)

        pygame.display.flip()

    def run(self):
        while self.running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    self.handle_key(event.key)

            self.update()
            self.draw()
            self.clock.tick(self.speed)

        pygame.quit()


def main():
    pygame.init()
    game = SnakeGame()
    game.run()


if __name__ == "__main__":
    main()
