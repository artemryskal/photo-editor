/** Описание возвращаемых свойств.
  img - изображение, которое необходимо загрузить.
  tooltip - объект данных для тултипа canvas.
  event - событие перерисовки.
  getByUrl - метод для получения картинки по url.
**/

export const useCanvasStore = defineStore('canvas', () => {
  const img = ref(null)
  const tooltip = reactive({
    active: false,
    x: 0,
    y: 0,
    screenX: 0,
    screenY: 0,
    color: null,
  })
  const event = ref(false)

  const getByUrl = async (url) => {
    try {
      const file = await fetch(url)
      return await file.blob()
    } catch (e) {
      throw new Error('Ошибка при загрузке изображения')
    }
  }

  return { img, tooltip, event, getByUrl }
})
