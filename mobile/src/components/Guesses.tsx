import { useEffect, useState } from 'react';
import { Box, useToast, FlatList } from 'native-base';
import { api } from '../services/api';
import { Game, GameProps } from './Game';
import { Loading } from './Loading';
import { EmptyMyPoolList } from './EmptyMyPoolList';

interface Props {
  poolId: string;
  code: string
}

export function Guesses({ poolId, code }: Props) {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [games, setGames] = useState<GameProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoint] = useState("")
  const [secondTeamPoints, setSecondTeamPoint] = useState("")

  async function fetchGames() {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/pools/${poolId}/games`);
      setGames(data.games)
    } catch (_err) {
      console.error(_err)
      toast.show({
        title: "Não foi possivel carregar os jogos",
        placement: "top",
        bgColor: "red.500"
      })
    } finally {
      setIsLoading(false)
    }
  };

  async function handleGuessConfirm(gameId: string) {
    try {
      setIsLoading(true);
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) return toast.show({
        title: "Informe o placar do palpite",
        placement: "top",
        bgColor: "red.500"
      });

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints)
      })

      toast.show({
        title: "Palpite realizado com sucesso!",
        placement: "top",
        bgColor: "green.500"
      });

      fetchGames()
    } catch (_err) {
      console.error(_err, _err.response.data);
      toast.show({
        title: "Não foi possivel enviar o palpite",
        placement: "top",
        bgColor: "red.500"
      })
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchGames() }, [poolId])

  if (isLoading) return <Loading />

  return (
    <FlatList
      data={games}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          setFirstTeamPoints={setFirstTeamPoint}
          setSecondTeamPoints={setSecondTeamPoint}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
        />
      )}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  );
}
