import { useEffect, useState, useCallback } from "react"
import { VStack, Icon, useToast, FlatList } from "native-base";
import { Octicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from "@react-navigation/native"

import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { api } from "../services/api";
import { PoolCard, PoolPros } from "../components/PoolCard";
import { EmptyPoolList } from "../components/EmptyPoolList"
import { Loading } from "../components/Loading";

export function Pools() {
  const { navigate } = useNavigation();
  const [pools, setPools] = useState<PoolPros[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  async function fetchPools() {
    try {
      setIsLoading(true);
      const { data } = await api.get<{ pools: PoolPros[] }>("/pools");
      setPools(data.pools);
    } catch (_err) {
      console.error(_err);
      toast.show({
        title: "Não foi possivel carregar os bolões",
        placement: "top",
        bgColor: "red.500"
      })
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchPools()
  }, []))

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Meus Bolões" />
      <VStack mt={6} mx={5} borderBottomWidth={1}
        borderBottomColor="gray.600"
        pb={4} mb={4}
      >
        <Button
          title="Buscar Bolão por código"
          leftIcon={<Icon as={Octicons} name="search" color="black" size="md" />}
          onPress={() => navigate('find')}
        />
      </VStack>
      {isLoading ? <Loading /> :
        <FlatList
          data={pools}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PoolCard
              onPress={() => navigate("details", { id: item.id })}
              data={item}
            />
          )}
          px={5}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 10 }}
          ListEmptyComponent={() => <EmptyPoolList />}
        />}
    </VStack>
  )
}