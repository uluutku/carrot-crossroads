import { useState, useEffect } from "react";
import LifeStage from "./LifeStage";
import "./Engine.css";
import LoadingAnimation from "../LoadingAnimation";
import choices from "./choices";
import generalGoodEndingImage from "../assets/ending-images/general-good-ending.jpeg";
import oldGoodEndingImage from "../assets/ending-images/old-good-ending.jpeg";
//import generalSadEndingImage from "../assets/ending-images/general-sad-ending.jpg";
import lowHappinessEndingImage from "../assets/ending-images/low-happiness-ending.jpeg";
import lowHealthEndingImage from "../assets/ending-images/low-health-ending.jpeg";
import lowMoneyEndingImage from "../assets/ending-images/low-money-ending.jpeg";
import bissEndingImage from "../assets/ending-images/biss-ending.jpeg";

function Engine() {
  const [animating, setAnimating] = useState(false);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [age, setAge] = useState(1);
  const [health, setHealth] = useState(10);
  const [money, setMoney] = useState(10);
  const [love, setLove] = useState(10);
  const [happiness, setHappiness] = useState(10);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (money == 0 && health > 0) {
      setHealth(0);
    }
  }, [money, health]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(
        () => {
          setAge((a) => {
            if (a > 100 || health <= 0) {
              clearInterval(interval);
              return a;
            }
            return a + 1;
          });
          setHealth((h) => {
            if (age >= 18) {
              h -= 5;
            }
            return h;
          });
        },
        age < 18 ? 200 : 2000
      );

      return () => clearInterval(interval);
    }
  }, [loading, age, money]);

  useEffect(() => {
    const availableChoices = filterChoices();
    if (availableChoices.length > 0 || age > 100 || health <= 0) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [age, health]);

  const filterChoices = () => {
    return choices
      .filter(
        (choice) =>
          age >= choice.ageRange.min &&
          age <= choice.ageRange.max &&
          !history.includes(choice.text)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
  };

  const restartGame = () => {
    setAnimating(false);
    setCurrentDecision(null);
    setAge(1);
    setHealth(10);
    setMoney(10);
    setLove(10);
    setHappiness(10);
    setHistory([]);
    setLoading(false);
  };

  const handleDecision = (choice) => {
    setCurrentDecision(choice);
    setAnimating(true);
    setTimeout(
      () => {
        let newMoney = money + choice.immediateEffects.money;
        if (newMoney < 0) {
          newMoney = 0;
        }
        setHealth(
          (h) => h + choice.immediateEffects.health - (age >= 18 ? 3 : 0)
        );
        setMoney(newMoney);
        setLove(love + choice.immediateEffects.love);
        setHappiness(happiness + choice.immediateEffects.happiness);
        setHistory([...history, choice.text]);
        setAge(age + 1);
        setAnimating(false);
      },
      age < 18 ? 100 : 2000
    );
  };

  const getEndGameMessage = () => {
    if (money <= 0) {
      return {
        image: lowMoneyEndingImage,
        message:
          "Oh! Görünüşe göre paranı iyi ayarlayamadın. Gelecek sefer bir karar almadan önce bunu başaracak paran olduğuna emin ol.",
      };
    }

    if (happiness >= 9999) {
      return {
        image: bissEndingImage,
        message: "Bosphorus ISS'de işe başladın! Daha ne olsun 😉",
      };
    }

    if (happiness <= -50) {
      return {
        image: lowHappinessEndingImage,
        message:
          "Üzgünüm! Kararından çok mutsuz oluğundan alkol bağımlısı oldun. Daha iyi kararlar vermek için yeniden yeniden dene.",
      };
    }

    if (age >= 60) {
      return {
        image: oldGoodEndingImage,
        message: "Tebrikler! 60 yaşına ulaştın!",
      };
    }
    if (health <= 0 && age > 25) {
      let image = lowHealthEndingImage;
      let message = `Sağlığın sebebi ile ${age} yaşında buralardan göçtün. Daha iyi kararlar vermek için yeniden yeniden dene.`;
      if (happiness >= 100 || love >= 100) {
        image = generalGoodEndingImage;
        message = `Tebrikler! Sağlık sorunların sebebi ile ${age} yaşında buralardan göçtün yine de mutlu ve sevgi dolu bir ömür yaşadın!`;
      } else if (happiness < 50 && love < 50) {
        image = lowHealthEndingImage;
        message = `Üzgünüm! Mutsuz bir hayat yaşadın ve sağlık sorunların sebebi ile ${age} yaşında buralardan göçtün. Daha iyi kararlar vermek için  yeniden dene.`;
      }
      return {
        image,
        message,
      };
    }
    return null;
  };

  const endGameMessage = getEndGameMessage();
  if (endGameMessage) {
    return (
      <div className="game-over">
        {endGameMessage.image && (
          <img
            src={endGameMessage.image}
            className="game-over-image"
            alt="End game"
          />
        )}
        <p className="ending-message-text">{endGameMessage.message}</p>
        <button onClick={restartGame} className="restart-button">
          Yeniden Başla
        </button>
      </div>
    );
  }

  return (
    <>
      <LoadingAnimation />
      <div className="game-page">
        <div className="game-container">
          <header>
            <h1>Tavşanın Durumu</h1>
            <div className="stats">
              <p className={age < 18 ? "low-stat" : ""}>Yaş: {age}🧒🏼</p>
              <p className={age >= 18 && health < 20 ? "low-stat" : ""}>
                Sağlık: {health}🫀
              </p>
              <p className={age >= 18 && money <= 500 ? "low-stat" : ""}>
                Para: {money}💸
              </p>
              <p className={age >= 18 && love < 0 ? "low-stat" : ""}>
                Aşk: {love}💖
              </p>
              <p className={age >= 18 && happiness < -30 ? "low-stat" : ""}>
                Mutluluk: {happiness}🙂
              </p>
            </div>
          </header>
          <section>
            {animating ? (
              <div className="loading">Zaman geçiyor...</div>
            ) : (
              <LifeStage
                choices={filterChoices()}
                onDecision={handleDecision}
              />
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Engine;
