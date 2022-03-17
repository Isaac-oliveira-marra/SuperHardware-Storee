<template>
    <q-page padding>
        <div class="row justify-center">
            <div class="col-12 text-center">
                <p class="text-h6">
                Configuração da Loja
                </p>
            </div>
        <q-form class="col-md-6 col-sm-6 col-xs-10 q-gutter-y-md" @submit.prevent="handleSubmit">
          <q-input
              label="Nome da loja"
              v-model="form.name"
              :rules="[val => (val && val.length > 0) || 'Preencha o campo ']"
          />
          <q-input
              label="Telefone para pedidos:"
              v-model="form.phone"
              mask="(##) #####-####"
              unmasked-value
          />
          <q-input
              label="Imagem do Paralax"
              stack-label
              v-model="paralax"
              type="file"
              accept="image/*"
          />

          <div class="row justify-center q-gutter-md">
            <div>
              <p style="font-family:italic" class="text-center">Cor Primaria:</p>
              <q-color v-model="form.primary" class="col-md-4 col-sm-12 col-xs-12"/>
            </div>
            <div>
              <p style="font-family:italic" class="text-center">Cor secundária:</p>
              <q-color v-model="form.secondary" class="col-md-4 col-sm-12 col-xs-12"/>
            </div>
          </div>

            <q-btn
              label="Salvar"
              color="primary"
              rounded
              type="submit"
              class="full-width"
            />
        </q-form>
        </div>
    </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import useNotify from 'src/Composables/UseNotify'
import useApi from 'src/Composables/UseApi'
import useBrand from 'src/composables/UseBrand'

export default defineComponent({
  name: 'PageMe',
  setup () {
    const table = 'config'
    const { list, update, uploadImg } = useApi()
    const { notifyError, notifySuccess } = useNotify()
    const { setBrand } = useBrand()
    let config = {}
    const paralax = ref([''])
    const form = ref({
      name: '',
      phone: '',
      primary: '',
      secondary: '',
      paralax_url: ''
    })

    onMounted(() => {
      handleGetConfig()
    })

    const handleSubmit = async () => {
      try {
        if (paralax.value.length > 0) {
          const paralaxUrl = await uploadImg(paralax.value[0], 'paralax')
          form.value.paralax_url = paralaxUrl
        }
        console.log(form.value)
        await update(table, form.value)
        notifySuccess('Atualizado com sucesso')
        setBrand(form.value.primary, form.value.secondary)
      } catch (error) {
        notifyError(error.message)
      }
    }

    const handleGetConfig = async () => {
      try {
        config = await list(table)
        form.value = config[0]
      } catch (error) {
        notifyError(error.message)
      }
    }

    return {
      handleSubmit,
      form,
      paralax
    }
  }
})
</script>
