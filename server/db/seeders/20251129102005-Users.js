'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.bulkInsert('Users', [
      { 
        name: 'Алексей Иванов', 
        email: 'alexey@news.ru', 
        hashpass: '123352',
        role: 'author',
        nsfwConsent: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        name: 'Дмитрий Сидоров', 
        email: 'dmitry@news.ru', 
        hashpass: '3445332',
        role: 'admin',
        nsfwConsent: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
