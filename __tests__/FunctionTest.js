const MissionUtils = require("@woowacourse/mission-utils");
const Input = require("../src/Input");
const Parse = require("../src/Parse");
const Question = require("../src/Question");
const BallCount = require("../src/BallCount");
const Game = require("../src/Game");
const { Output } = require("../src/Output");

const mockQuestions = (answers) => {
  MissionUtils.Console.readLine = jest.fn();
  answers.reduce((acc, input) => {
    return acc.mockImplementationOnce((question, callback) => {
      callback(input);
    });
  }, MissionUtils.Console.readLine);
};

const mockRandoms = (numbers) => {
  MissionUtils.Random.pickNumberInRange = jest.fn();
  numbers.reduce((acc, number) => {
    return acc.mockReturnValueOnce(number);
  }, MissionUtils.Random.pickNumberInRange);
};

const getPrintLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, "print");
  logSpy.mockClear();
  return logSpy;
};

describe("기능 테스트", () => {
  test("화면에 문구 출력", () => {
    const logSpy = getPrintLogSpy();

    Output.printToUser("Hello");

    expect(logSpy).toBeCalledTimes(1);
    expect(logSpy).toBeCalledWith("Hello");
  });

  test("숫자를 배열로 바꾸기", () => {
    const number = 123;
    const parsed = Parse.numberToArray(number);
    expect(parsed).toEqual([1, 2, 3]);
  });

  test("사용자 답 받아오기", () => {
    const answer = 351;

    MissionUtils.Console.readLine = jest.fn((ask, callback) => {
      callback(answer);
    });

    const userAnswer = Input.getUserAnswer();

    expect(userAnswer).toEqual([3, 5, 1]);
  });

  test("재시작 여부 받아오기: 재시작", () => {
    const request = 1;
    const logSpy = getPrintLogSpy();

    MissionUtils.Console.readLine = jest.fn((ask, callback) => {
      callback(request);
    });

    const userWantsReplay = Input.getReplayRequest();

    expect(logSpy).toBeCalledWith("게임을 새로 시작하려면 1, 종료하려면 2를 입력하세요.");
    expect(userWantsReplay).toBe(true);
  });

  test("재시작 여부 받아오기: 종료", () => {
    const request = 2;
    const logSpy = getPrintLogSpy();

    MissionUtils.Console.readLine = jest.fn((ask, callback) => {
      callback(request);
    });

    const userWantsReplay = Input.getReplayRequest();

    expect(logSpy).toBeCalledWith("게임을 새로 시작하려면 1, 종료하려면 2를 입력하세요.");
    expect(userWantsReplay).toBe(false);
  });

  test("문제 내기", () => {
    const question = Question.create();

    expect(question.length).toBe(3);
    for (let i = 0; i < 3; i++) {
      expect(question[i]).toBeGreaterThan(0);
      expect(question[i]).toBeLessThan(10);
      expect(Math.floor(question[i])).toBe(question[i]);
    }
    expect(question[0]).not.toBe(question[1]);
    expect(question[0]).not.toBe(question[2]);
    expect(question[1]).not.toBe(question[2]);
  });

  test("스트라이크 개수 세기", () => {
    const question = [1, 2, 3];
    const answer = [1, 2, 4];
    const ballCount = new BallCount(question, answer);
    expect(ballCount.strikes).toBe(2);
  });

  test("볼 개수 세기", () => {
    const question = [1, 2, 3];
    const answer = [2, 3, 1];
    const ballCount = new BallCount(question, answer);
    expect(ballCount.balls).toBe(3);
  });

  test("삼진 아웃 검증하기", () => {
    const question = [1, 2, 3];

    const answer1 = [1, 2, 3];
    const answer2 = [1, 2, 4];

    const ballCount1 = new BallCount(question, answer1);
    const ballCount2 = new BallCount(question, answer2);

    const isThreeStrikes1 = ballCount1.isThreeStrikes();
    const isThreeStrikes2 = ballCount2.isThreeStrikes();

    expect(isThreeStrikes1).toBe(true);
    expect(isThreeStrikes2).toBe(false);
  });

  test("볼 카운트 문자열로 바꾸기", () => {
    const count1 = new BallCount([1, 2, 3], [1, 3, 4]);
    const count2 = new BallCount([1, 2, 3], [4, 5, 6]);
    const count3 = new BallCount([1, 2, 3], [4, 2, 3]);
    const count4 = new BallCount([1, 2, 3], [3, 7, 2]);

    expect(count1.toString()).toBe("1볼 1스트라이크");
    expect(count2.toString()).toBe("낫싱");
    expect(count3.toString()).toBe("2스트라이크");
    expect(count4.toString()).toBe("2볼");
  });

  test("게임 진행", () => {
    const randoms1 = [1, 3, 5];
    const randoms2 = [5, 8, 9];
    const answers1 = ["246", "135"];
    const answers2 = ["597", "589"];
    const logSpy = getPrintLogSpy();
    const messages1 = ["낫싱", "3스트라이크", "게임 종료"];
    const messages2 = ["1볼 1스트라이크", "3스트라이크", "게임 종료"];

    mockRandoms(randoms1);
    mockQuestions(answers1);

    const game1 = new Game();
    game1.run();

    messages1.forEach((output) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(output));
    });

    mockRandoms(randoms2);
    mockQuestions(answers2);

    const game2 = new Game();
    game2.run();

    messages2.forEach((output) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(output));
    });
  });
});
