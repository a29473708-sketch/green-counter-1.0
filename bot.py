from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(token="7741711253:AAEfnag9PzmjgoxcAhZy10H4UInQRSWPJ-I")
dp = Dispatcher()

async def main():
    """Главная функция для запуска бота"""
    logger.info("Бот запускается...")
    await dp.start_polling(bot)

 
@dp.message(Command("start"))
async def start_command(message: types.Message):
    """Обработчик команды /start"""
    await message.answer(" Привет! Я бот для подсчета калорий!\n\nНапишите /help для списка команд.")

@dp.message(Command("help"))
async def help_command(message: types.Message):
    """Обработчик команды /help"""
    help_text = """
Доступные команды:
/start - Начать работу с ботом
/help - Показать справку
/about - О боте
/miniapp - Открыть мини-приложение
"""
    await message.answer(help_text)

@dp.message(Command("about"))
async def about_command(message: types.Message):
    await message.answer("CalorieCounter Bot\nВерсия 1.0\n")

@dp.message(Command("miniapp"))
async def miniapp_command(message: types.Message):
    """Обработчик команды /miniapp"""
    logger.info(f"Получена команда /miniapp от пользователя {message.from_user.id}")
    
    keyboard = types.InlineKeyboardMarkup(
        inline_keyboard=[
            [
                types.InlineKeyboardButton(
                    text="📱 Открыть Mini App",
                    web_app=types.WebAppInfo(url="https://a29473708-sketch.github.io/green-counter-1.0/")
                )
            ]
        ]
    )
    
    await message.answer(
        "Нажмите кнопку ниже, чтобы открыть мини-приложение:",
        reply_markup=keyboard
    )
    logger.info("Mini App отправлена пользователю")


if __name__ == "__main__":
    asyncio.run(main())