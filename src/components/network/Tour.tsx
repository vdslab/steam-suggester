'use client';
import Joyride, { CallBackProps, STATUS } from 'react-joyride'

const steps = [
  {
    target: 'body',
    content: '類似してるゲームを近くで表示させています。',
    disableBeacon: true,
  },
  {
    target: '.step3',
    content: 'グラフのゲーム配置を変更できます。',
  },
  {
    target: '.step1',
    content: '表示するゲームの絞りこみができます。',
  },
  {
    target: '.step2',
    content: '配信者が過去に配信したゲームを強調表示できます。',
  },
  {
    target: '.step4',
    content: 'Steamアカウントと連携して、自分とフレンドの所持してるゲームを表示できます。',
  },
  {
    target: '.step5',
    content: '表示されていないゲームの追加ができます。',
  },
  {
    target: '.step6',
    content: '表示中のゲームの一覧を人気ランキングのリストにして表示しています。',
  },

];

type Props = {
  run: boolean;
  setRun: React.Dispatch<React.SetStateAction<boolean>>;
}

const Tour = (props:Props) => {

  const { run, setRun} = props;

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
    }
  };


  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#0d6efd',
        },
      }}
      locale={{
        back: '戻る',
        close: '閉じる',
        last: '完了',
        next: '次へ',
        skip: '終了',
      }}
    />
  )
}

export default Tour