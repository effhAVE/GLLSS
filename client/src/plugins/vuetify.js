import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        dark: true,
        themes: {
            dark: {
                primary: "#1E1E2D",
                secondary: "#A0251E",
                accent: "#FFCA19",
                anchor: "#FFCA19"
            }
        }
    }
});
