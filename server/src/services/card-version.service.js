const { CardVersion, ProductCard } = require('../../db/models');

class CardVersionService {
  // Создание новой версии
  static async createVersion(cardId, data, userId) {
    // Проверка прав доступа
    const card = await ProductCard.findOne({ 
      where: { id: cardId, userId } 
    });
    
    if (!card) {
      throw new Error('Card not found');
    }

    // Получение последней версии
    const lastVersion = await CardVersion.findOne({
      where: { cardId },
      order: [['version', 'DESC']],
    });

    const newVersionNumber = lastVersion ? lastVersion.version + 1 : 1;

    // Ограничение количества версий (храним максимум 50)
    const versionCount = await CardVersion.count({ where: { cardId } });
    if (versionCount >= 50) {
      // Удаляем самую старую версию
      const oldestVersion = await CardVersion.findOne({
        where: { cardId },
        order: [['version', 'ASC']],
      });
      if (oldestVersion) {
        await oldestVersion.destroy();
      }
    }

    // Создание новой версии
    return CardVersion.create({
      cardId,
      version: newVersionNumber,
      canvasData: data.canvasData || card.canvasData,
      title: data.title || card.title,
      description: data.description || card.description,
      changeDescription: data.changeDescription,
    });
  }

  // Получение всех версий карточки
  static async getVersions(cardId, userId) {
    // Проверка прав доступа
    const card = await ProductCard.findOne({ 
      where: { id: cardId, userId } 
    });
    
    if (!card) {
      throw new Error('Card not found');
    }

    return CardVersion.findAll({
      where: { cardId },
      order: [['version', 'DESC']],
    });
  }

  // Получение конкретной версии
  static async getVersionById(versionId, userId) {
    const version = await CardVersion.findByPk(versionId, {
      include: [{
        model: ProductCard,
        as: 'card',
        where: { userId },
      }],
    });

    if (!version) {
      throw new Error('Version not found');
    }

    return version;
  }

  // Восстановление версии
  static async restoreVersion(versionId, userId) {
    const version = await this.getVersionById(versionId, userId);
    const card = version.card;

    // Обновление карточки данными из версии
    await card.update({
      canvasData: version.canvasData,
      title: version.title,
      description: version.description,
    });

    // Создание новой версии с восстановленными данными
    return this.createVersion(card.id, {
      canvasData: version.canvasData,
      title: version.title,
      description: version.description,
      changeDescription: `Восстановлено из версии ${version.version}`,
    }, userId);
  }

  // Сравнение двух версий
  static async compareVersions(versionId1, versionId2, userId) {
    const version1 = await this.getVersionById(versionId1, userId);
    const version2 = await this.getVersionById(versionId2, userId);

    if (version1.cardId !== version2.cardId) {
      throw new Error('Versions belong to different cards');
    }

    return {
      version1: {
        id: version1.id,
        version: version1.version,
        createdAt: version1.createdAt,
        canvasData: version1.canvasData,
      },
      version2: {
        id: version2.id,
        version: version2.version,
        createdAt: version2.createdAt,
        canvasData: version2.canvasData,
      },
      differences: this.calculateDifferences(version1.canvasData, version2.canvasData),
    };
  }

  // Вычисление различий между версиями
  static calculateDifferences(data1, data2) {
    const differences = [];
    
    // Простое сравнение объектов
    const keys1 = Object.keys(data1 || {});
    const keys2 = Object.keys(data2 || {});
    const allKeys = new Set([...keys1, ...keys2]);

    allKeys.forEach(key => {
      if (JSON.stringify(data1?.[key]) !== JSON.stringify(data2?.[key])) {
        differences.push({
          key,
          oldValue: data1?.[key],
          newValue: data2?.[key],
        });
      }
    });

    return differences;
  }

  // Автосохранение версии
  static async autoSave(cardId, canvasData, userId) {
    const card = await ProductCard.findOne({ 
      where: { id: cardId, userId } 
    });
    
    if (!card) {
      return null;
    }

    // Проверяем, изменились ли данные
    const lastVersion = await CardVersion.findOne({
      where: { cardId },
      order: [['version', 'DESC']],
    });

    // Если данные не изменились, не создаем новую версию
    if (lastVersion && 
        JSON.stringify(lastVersion.canvasData) === JSON.stringify(canvasData)) {
      return lastVersion;
    }

    // Создаем версию с пометкой автосохранения
    return this.createVersion(cardId, {
      canvasData,
      changeDescription: 'Автосохранение',
    }, userId);
  }
}

module.exports = CardVersionService;
