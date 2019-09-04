#include <SFML/Graphics.hpp>
#include <iostream>
#include <cstdlib>
#include <ctime>

#define byte unsigned char // я решил использовать байты для типо экономии памяти, а unsigned char - это есть по сути байт

//tiles
// 0 - void
// 1 - wall
// 2 - floor

// константы
const byte TILE_WIDTH = 16;
const byte TILE_HEIGHT = 16;
const byte MAP_WIDTH = 64;
const byte MAP_HEIGHT = 64;
const byte MIN_ROOM_COUNT = 10;
const byte MAX_ROOM_COUNT = 20;
const byte MIN_ROOM_WIDTH = 5;
const byte MAX_ROOM_WIDTH = 15;
const byte MIN_ROOM_HEIGHT = 5;
const byte MAX_ROOM_HEIGHT = 15;
const byte MIN_EXIT_COUNT = 1;
const byte MAX_EXIT_COUNT = 4;

// данные о тайлах хранятся в матрице, поэтому по передивжению по координатам можно проверять тайл и так проверять столкноыение
byte map[MAP_WIDTH * MAP_HEIGHT];

// рандом в диапазоне [min; max]
int random(byte min, byte max) {
	return rand() % (max - min + 1) + min;
}

// чтобы брать индекс с матрицы, так как я сделал ее на самом деле как одномерный массив для оптимизации памяти
unsigned int index(byte x, byte y) {
	return y * MAP_WIDTH + x;
}

enum Direction {
	Up,
	Right,
	Down,
	Left
};

// начинал делать алгортим для рисования пути но он не сделан, он только немного дорогу нарисует и всё
struct PathDrawer {
	byte x, y;

	void go(Direction d) {
		switch (d) {
		case Up:
			y--;
			break;
		case Right:
			x++;
			break;
		case Down:
			y++;
			break;
		case Left:
			x--;
			break;
		}
		map[index(x, y)] = 2;
	};

	bool check(Direction d) {
		byte cx, cy;
		cx = x;
		cy = y;

		switch (d) {
		case Up:
			cy--;
			break;
		case Right:
			cx++;
			break;
		case Down:
			cy++;
			break;
		case Left:
			cx--;
			break;
		}

		if (map[index(cx, cy)] == 1) {
			return true;
		} 
		else if (cx < 1) {
			return true;
		}
		else if (cy < 1) {
			return true;
		}
		else if (cx > MAP_WIDTH - 2) {
			return true;
		}
		else if (cy > MAP_HEIGHT - 2) {
			return true;
		}
		return false;
	}
};

struct Exit {
	PathDrawer drawer;
	byte x, y;

	void create_path(byte x, byte y) {
		drawer.x = this->x;
		drawer.y = this->y;

		for (int i = 0; i < 10; ++i) {
			if (!(drawer.check(Up))) {
				drawer.go(Up);
			}
			else if (!(drawer.check(Right))) {
				drawer.go(Right);
			}
			else if (!(drawer.check(Down))) {
				drawer.go(Down);
			}
			else if (!(drawer.check(Left))) {
				drawer.go(Left);
			}
			else {
				break;
			}
		}
	}
};

struct Room {
public:
	byte x, y;
	byte width, height;
	std::vector<Exit> exits;

	Room() {
		do {
			this->width = random(MIN_ROOM_WIDTH, MAX_ROOM_WIDTH);
			this->height = random(MIN_ROOM_HEIGHT, MAX_ROOM_HEIGHT);
			this->x = random(0, MAP_WIDTH - this->width);
			this->y = random(0, MAP_HEIGHT - this->height);
		} while (is_colliding()); // делаем комнату, пока она никак не мешает другим комнатам
	}

	void create_exits() { // определяем сколько и где у комнаты будут выходы
		byte exit_count = random(MIN_EXIT_COUNT, MAX_EXIT_COUNT);

		for (int i = 0; i < exit_count; ++i) {
			Exit exit;
			bool exit_collides;
			do {
				byte wall = random(0, 3);
				switch (wall) {
				case 0:
					exit.x = random(this->x + 1, this->x + this->width - 2);
					exit.y = this->y;
					break;
				case 1:
					exit.x = this->x + this->width - 1;
					exit.y = random(this->y + 1, this->y + this->height - 2);
					break;
				case 2:
					exit.x = random(this->x + 1, this->x + this->width - 2);
					exit.y = this->y + this->height - 1;
					break;
				case 3:
					exit.x = this->x;
					exit.y = random(this->y + 1, this->y + this->height - 2);
					break;
				}

				exit_collides = false;

				if (exit.x < 2) {
					exit_collides = true;
				}
				else if (exit.y < 2) {
					exit_collides = true;
				}
				else if (exit.x > MAP_WIDTH - 3) {
					exit_collides = true;
				}
				else if (exit.y > MAP_HEIGHT - 3) {
					exit_collides = true;
				}

				if (!exit_collides) {
					for (byte i = 0; i < exits.size(); ++i) {
						if (exits[i].x == exit.x && exits[i].y == exit.y) {
							exit_collides = true;
							break;
						}
						else if (exits[i].x == exit.x + 1 && exits[i].y == exit.y
							|| exits[i].x == exit.x && exits[i].y == exit.y + 1
							|| exits[i].x == exit.x - 1 && exits[i].y == exit.y
							|| exits[i].x == exit.x && exits[i].y == exit.y - 1) {
							exit_collides = true;
							break;
						}
					}
				}

			} while (exit_collides);
			exits.push_back(exit);
		}
	}
	
	// начинал делать создании соединений
	void create_exit_paths() {
		for (int i = 0; i < exits.size(); ++i) {
			exits[i].create_path(0, 0);
		}
	}
	
	void draw_exits() {
		for (int i = 0; i < exits.size(); ++i) {
			map[index(exits[i].x, exits[i].y)] = 2;
		}
	}

	// "рисуем" комнату и её выходы на матрице
	void draw() {
		for (int i = 0; i < this->width; ++i) {
			map[index(this->x + i, this->y)] = 1;
		}
		for (int y = 1; y < this->height - 1; ++y) {
			map[index(this->x, this->y + y)] = 1;
			for (int x = 1; x < this->width - 1; ++x) {
				map[index(this->x + x, this->y + y)] = 2;
			}
			map[index(this->x + this->width - 1, this->y + y)] = 1;
		}
		for (int i = 0; i < width; ++i) {
			map[index(this->x + i, this->y + this->height - 1)] = 1;
		}
		
		
	}
	

private:
	bool is_colliding() {
		for (int x = 0; x < this->width; ++x) {
			for (int y = 0; y < this->height; ++y) {
				byte tile = map[index(this->x + x, this->y + y)];
				if (tile != 0) {
					return true;
				}
			}
		}
		return false;
	}
};

int main() {
	srand(time(NULL));

	std::vector<Room> rooms;
	byte room_count = random(MIN_ROOM_COUNT, MAX_ROOM_COUNT); // определяем сколько комнат

	for (int i = 0; i < MAP_WIDTH * MAP_HEIGHT; ++i) { // на всякий случай заполнил всю матрицу нулями
		map[i] = 0;
	}

	sf::RenderTexture map_texture;
	map_texture.create(TILE_WIDTH * MAP_WIDTH, TILE_HEIGHT * MAP_HEIGHT); // создал текстуру на которой потом карта нарисуется
	sf::Texture tiles_texture;
	tiles_texture.loadFromFile("tiles.png"); // загрузил текстуру тайлов
	sf::Sprite tile;
	tile.setTexture(tiles_texture); // спрайт используют текстуру тайлов
	sf::IntRect rect(0, 0, TILE_WIDTH, TILE_HEIGHT); // создал пока прямоугольную область, которая будет потом использоваться для выборы отдельной части текчтуры тайлов

	for (int i = 0; i < room_count; ++i) {
		Room room;
		room.draw();
		rooms.push_back(room);
	}
	for (int i = 0; i < room_count; ++i) {
		rooms[i].create_exits();
		rooms[i].draw_exits();
	}
	for (int i = 0; i < room_count; ++i) {
		rooms[i].create_exit_paths();
	} // создание комнат, их выходов и каких-то недоделанных соединений

	map_texture.clear(); // на всякий случай очистил текстуру карты

	for (int y = 0; y < MAP_HEIGHT; ++y) {
		for (int x = 0; x < MAP_WIDTH; ++x) {
			rect.left = map[index(x, y)] * TILE_WIDTH;
			tile.setTextureRect(rect);
			tile.setPosition(x * TILE_WIDTH, y * TILE_HEIGHT);
			map_texture.draw(tile);
		}
	} // рисуем на текстуре карту, определяя тип тайла по матрице

	sf::Image map_image = map_texture.getTexture().copyToImage();
	map_image.saveToFile("map.png"); // сохранил текстуру карты в файл

	return 0;
}