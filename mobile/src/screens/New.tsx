import { Heading, Text, VStack, useToast } from "native-base";
import { Header } from "../components/Header";
import Logo from '../assets/logo.svg';
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useState } from "react";
import { api } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export function New() {
  const { navigate } = useNavigation()
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  async function handlePoolCreate() {
    if (!title.trim()) {
      return toast.show({
        title: "Informe o nome do seu bolão",
        placement: "top",
        bgColor: "red.500"
      })
    }

    try {
      setIsLoading(true);

      await api.post("/pools", { title })
      toast.show({
        title: "Bolão criado com sucesso",
        placement: "top",
        bgColor: "green.500"
      });
      setTitle('');
      navigate("pools");
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

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Criar novo Bolão" />

      <VStack mt={8} mx={5} alignItems={'center'}>
        <Logo />
        <Heading fontFamily="heading"
          color="white" fontSize="xl" my={8}
          textAlign="center">
          Crie seu próprio bolão da copa {'\n'}
          e compartilhe entre amigos!
        </Heading>

        <Input
          mb={2}
          placeholder="Qual nome do seu bolão?"
          onChangeText={setTitle}
          value={title}
        />

        <Button
          title="Criar meu Bolão"
          onPress={handlePoolCreate}
          isLoading={isLoading}
        />

        <Text color="gray.200" fontSize="sm" textAlign="center" px={10} mt={4}>
          Após criar seu bolão, você receberá um código único que poderá usar para convidar outras pessoas.
        </Text>
      </VStack>
    </VStack>
  )
}