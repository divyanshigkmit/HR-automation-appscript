const generateBirthdayContent = (havingBirthday) => {
  const birthdayContents = [
    `Wishing you a beautiful day with good health and happiness forever. Happy birthday, ${havingBirthday}!`,
    `May only the best come your way today and always! Wishing you a birthday full of beautiful surprises and joyous moments. Happy Birthday, ${havingBirthday}!`,
    `May this special day be full of joy, surprises, and fun. May this day become as incredible as you are. Happy Birthday, ${havingBirthday}! `,
    `Here’s to your birthday—a big day of new beginnings! Wishing you a year brimming with much-deserved good health, happiness, and joy. We hope you enjoy your day in style! Happy Birthday, ${havingBirthday}!`,
  ];

  const birthdayContent =
    birthdayContents[Math.floor(Math.random() * birthdayContents.length)];
  return birthdayContent;
};

const generateWorkAnniversaryContent = (havingWorkAnniversary) => {
  const workAnniversaryContents = [
    `Congratulations ${havingWorkAnniversary}, on achieving years of exemplary service. Good wishes to you for continued success in all your endeavours. Happy Work Anniversary`,
    `Here at GKM IT, we wish you a pleasing work anniversary. We appreciate all the hours you put in and the smile you wear to work every day. Happy Work Anniversary, ${havingWorkAnniversary}!`,
    `${havingWorkAnniversary}, we are sending you the heartiest congratulations on completing years of success and achieving goals in this organisation. Happy Work Anniversary!`,
  ];
  const workAnniversaryContent =
    workAnniversaryContents[
      Math.floor(Math.random() * workAnniversaryContents.length)
    ];
  return workAnniversaryContent;
};

const generateMarriageAnniversaryContents = (havingMarriageAnniversary) => {
  const marriageAnniversaryContents = [
    `Wishing you both all the love and happiness on your anniversary. Enjoy looking back on all of your special memories together. Happy marriage anniversary, ${havingMarriageAnniversary}!`,
  ];
  const marriageAnniversaryContent =
    marriageAnniversaryContents[
      Math.floor(Math.random() * marriageAnniversaryContents.length)
    ];
  return marriageAnniversaryContent;
};

module.exports = {
  generateBirthdayContent,
  generateWorkAnniversaryContent,
  generateMarriageAnniversaryContents,
};
