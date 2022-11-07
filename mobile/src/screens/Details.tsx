import { useEffect, useState } from "react";
import { Share } from "react-native"
import { useRoute } from "@react-navigation/native";
import { HStack, useToast, VStack } from "native-base";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { api } from "../services/api";
import { PoolPros } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";
import { Guesses } from "../components/Guesses";

interface RouteParams {
  id: string
}

export function Details() {
  const route = useRoute();
  const toast = useToast();
  const { id } = route.params as RouteParams;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pool, setPool] = useState<PoolPros>();
  const [optionSelected, setOptionSelected] = useState<"guesses" | "ranking">("guesses")

  async function fetchPoolDetails() {
    try {
      setIsLoading(true);

      const { data } = await api.get(`/pools/${id}`);
      setPool(data.pool)
    } catch (_err) {
      console.error(_err);
      toast.show({
        title: "Não foi possivel criar o bolão",
        placement: "top",
        bgColor: "red.500"
      })
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: `Venha palpitar nos jogos da copa no meu bolão! Acesse o codigo ${pool.code}`,
    })
  }

  useEffect(() => { fetchPoolDetails() }, [id])

  if (isLoading) return <Loading />

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title={pool.title} showBackButton showShareButton onShare={handleCodeShare} />
      {pool._count.participants > 0 ?
        <VStack px={5} flex={1}>
          <PoolHeader data={pool} />
          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              isSelected={optionSelected === "guesses"}
              title="Seus palpites"
              onPress={() => setOptionSelected("guesses")}
            />
            <Option
              isSelected={optionSelected === "ranking"}
              title="Ranking do grupo"
              onPress={() => setOptionSelected("ranking")}
            />
          </HStack>
          <Guesses poolId={pool.id} code={pool.code} />
        </VStack>
        : <EmptyMyPoolList code={pool.code} />
      }
    </VStack>
  )
}