import useSupabase from 'src/boot/supabase'
import userAuthUser from 'src/Composables/userAuthUser'
import { v4 as uuidv4 } from 'uuid'
import { useRoute } from 'vue-router'
import useBrand from 'src/Composables/UseBrand'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const brand = ref({
  primary: '',
  secondary: '',
  name: '',
  phone: '',
  paralax_url: ''
})

export default function useApi () {
  const { supabase } = useSupabase()
  const { user } = userAuthUser()
  const route = useRoute()
  const { setBrand } = useBrand()
  const $q = useQuasar()

  const list = async (table) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
    if (error) throw error
    return data
  }

  const listPublic = async (table, userId, columFilter = '', filter = '') => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .eq(columFilter, filter)
    if (error) throw error
    return data
  }

  const getById = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
    if (error) throw error
    return data[0]
  }

  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([{
        ...form,
        user_id: user.value.id
      }])
    if (error) throw error
    return data
  }

  const update = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .update({
        ...form
      })
      .match({ id: form.id })
    if (error) throw error
    return data
  }

  const remove = async (table, id) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .match({ id })
    if (error) throw error
    return data
  }

  const uploadImg = async (file, storage) => {
    const fileName = uuidv4()
    const { error } = supabase
      .storage
      .from(storage)
      .upload(fileName, file, {
        cacheControl: '36000',
        upsert: false
      })
    const publicUrl = await getUrlPublic(fileName, storage)
    if (error) throw error
    return publicUrl
  }

  const getUrlPublic = async (fileName, storage) => {
    const { publicURL, error } = supabase
      .storage
      .from(storage)
      .getPublicUrl(fileName)
    if (error) throw error
    return publicURL
  }

  const getBrand = async () => {
    const id = user?.value?.id || route.params.id
    if (id) {
      $q.loading.show({
        backgroundColor: 'blue-grey-10'
      })
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('user_id', id)
      if (error) throw error
      if (data.length > 0) {
        brand.value = data[0]
        setBrand(brand.value.primary, brand.value.secondary)
      }
      $q.loading.hide()
      return brand
    }
  }

  return {
    list,
    getById,
    listPublic,
    post,
    update,
    remove,
    uploadImg,
    getBrand,
    brand
  }
}
