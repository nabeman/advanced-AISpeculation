const { createApp, reactive } = Vue;
// const { axios } = Axios;
const MAXLEN = 3;
let turn_flag = false;

const QuizData = reactive({
    word_list: ["tomato", "internet", "urban", "design", "game", "glass", "money", "book"],
    select_list: [], //画像生成に選んだ単語リスト
    imgsrc: "",
    turn_flag: false,
    componentId: "select-word",
    point: 0,
});

const app = createApp({
    data(){
        return{
            componentId: QuizData.componentId,
            turn_flag: QuizData.turn_flag,
        }
    },
    methods: {
        currentId(){
            return this.componentId;
        }
    },
})

//画像を生成するための単語を選ぶコンポーネント
app.component(
    'select-word',
    {
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [],
            }
        },
        methods: {
            input_answer(word){
                if(this.select_list.length >= MAXLEN){
                    this.select_list.push(word);
                    this.select_list.shift();
                }
                else{
                    this.select_list.push(word);
                }
                return console.log(word);
            },
            makeimg(){
                let words = `${this.select_list[0]} ${this.select_list[1]} ${this.select_list[2]}`
                let post = axios.post("http://localhost:9000/", { word: words }).then((response) => {
                    console.log("postで送信");
                    this.catchimg(response.data);
                }).catch((err) =>{
                    console.log("エラー");           
                    console.log(err);    
                });
            },
            catchimg(img){
                //imgはbase64形式
                QuizData.select_list = this.select_list; //正解を格納
                QuizData.imgsrc = "data:image/png;base64," + img;
                QuizData.turn_flag = !QuizData.turn_flag;
                QuizData.componentId = "answer";
                // document.getElementById("img").src = "data:image/png;base64," + img;
            },
        },
        template: `
        <h2>単語を3つ選んでください</h2>
        <div v-for="i in word_list" :key="i">
            <button @click="input_answer(i)" :id="i">{{ i }}</button>
        </div>
        <h3>選んでいる単語</h3>
        <div v-for="i in select_list" :key="i">
            <h4>{{ i }}</h4>
        </div>
        <button @click="makeimg">
            作成する
        </button>
        <turn-guess v-if="QuizData.turn_flag"></turn-guess>
        `
    }
)

// 作成者と推測者のターンをスイッチするためのフラグを変えるコンポーネント
app.component(
    'change-turn',
    {
        data: function(){
            turn_flag = false;
            return{
            }
        }
    }
)

// 推測者のターンを表示するコンポーネント
app.component(
    'turn-guess',
    {
        data(){
            return{
                
            }
        },
        template: `
            <h4>単語を当てる人のターンです</h4>
            <p>画像を作った単語を、最大3つまで推測して選んでください</p>
        `
    }
)

app.component(
    'answer',
    {
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [],
                imgsrc: QuizData.imgsrc,
                point: 0
            }
        },
        methods: {
            input_answer(word){
                if(this.select_list.length >= MAXLEN){
                    this.select_list.push(word);
                    this.select_list.shift();
                }
                else{
                    this.select_list.push(word);
                }
                return console.log(word);
            },
            guess_answer(){
                for(let i = 0; i < this.select_list.length; i++){
                    let len = QuizData.select_list.length;
                    let checklist = QuizData.select_list;
                    checklist.push(this.select_list[i]);
                    let newlist = new Set(checklist);
                    if(newlist.length == len){
                        this.point++;
                    }
                }
                QuizData.point = this.point;
                console.log(`現在の得点は${QuizData.pointです}`);
                QuizData.componentId = "select_word";
            }
        },
        template: `
            <img id="img" src="imgsrc" width="1024" height="1024" />
            <div v-for="i in word_list" :key="i">
            <button @click="input_answer(i)" :id="i">{{ i }}</button>
            </div>
            <h3>選んでいる単語</h3>
            <div v-for="i in select_list" :key="i + '_s'">
                <h4>{{ i }}</h4>
            </div>
            <button @click=guess_answer>推測する</button>
            
        `
    }
)



app.mount("#main");