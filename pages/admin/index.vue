<template>
    <div class="admin-panel">
        <div class="admin-panel__login" v-if="!loggedIn">
            <input placeholder="Пароль" class="admin-panel__input" v-model="code" />
            <a class="admin-panel__button" @click="login()">Войти</a>
        </div>
        <div class="admin-panel__inner" v-else>
            <input placeholder="Поиск" class="admin-panel__input" v-model="search" />
            <div class="admin-panel__cards">
                <div class="admin-panel__card" v-for="(item, $index) in paginatedData" :key="$index">
                    <div class="admin-panel__card__name">{{item.name}}</div>
                    <div class="admin-panel__card__address">{{item.address}}</div>
                    <div class="admin-panel__card__problems"><strong>Проблемы: </strong>{{item.problems.join(', ')}}</div>
                    <div class="admin-panel__card__description"><strong>Решения: </strong>{{item.description}}</div>
                    <div class="admin-panel__card__work-count"><strong>Кол-во мест: </strong>{{item.jobs_count}}</div>
                    <a class="admin-panel__button" v-if="!item.show_on_main" @click="addToMain(item)">Показывать на главной</a>
                    <a class="admin-panel__button admin-panel__button--active" v-else @click="removeFromMain(item)">Не показывать на главной</a>
                </div>
            </div>
            <div class="admin-panel__pagination">
                <a class="admin-panel__page" @click="page = $index" :class="{'admin-panel__page--active': page === $index}" v-for="$index in (1, pagesCount)">
                    {{$index}}
                </a>
            </div>
        </div>

     </div>
</template>
<style lang="scss" scoped>
    .admin-panel {
        &__inner {
            padding: 2em 1em;
            max-width: 640px;
            margin: 0 auto;
            position: relative;
        }

        &__card {
            background: #f8f8f9;
            padding: 1em;
            border-radius: 1em;
            margin: 0 0 1em;

            &__name {
                font-size: 1.5em;
                font-weight: bold;
            }

            &__address {
                font-size: 1.125em;
                margin: 0 0 1em;
            }



            &__work-count {
                margin: 0 0 1em;
            }
        }
        &__pagination {
            position: fixed;
            top: 2em;
            right: 1em;
            display: flex;
            flex-direction: column;
            height: calc(100% - 4em);
            overflow: auto;
            &::-webkit-scrollbar-track
            {
                border-radius: 0;
                background-color: #fff;
            }

            &::-webkit-scrollbar
            {
                width: 10px;
                background-color: #fff;
            }

            &::-webkit-scrollbar-thumb
            {
                border-radius: 10px;
                background-color: #ccc;
            }
        }
        &__button {
            display: inline-flex;
            justify-content: center;
            align-items: center;
            text-decoration: none;
            border: 1.5px solid #052dff;
            box-sizing: border-box;
            border-radius: 30px;
            padding: 15px 25px;
            background: 0 0;
            font-weight: 700;
            font-size: 16px;
            transition: all .2s ease;
            cursor: pointer;
            &--active {
                color: #fff;
                background: #052dff;
            }
        }
        &__page {
            width: 2em;
            background: #f8f8f9;
            text-align: center;
            padding: .25em;
            margin: 0 .5em .5em;
            border-radius: .25em;
            cursor: pointer;

            &--active {
                background: #052dff;
                color: #fff;
            }
        }
        &__input {
            background: #f8f8f9;
            border: none;
            font: inherit;
            width: 100%;
            padding: 1em;
            border-radius: 1em;
            margin: 0 0 1em;
        }
        &__login {
            padding: 0 1em;
            max-width: 640px;
            margin: 2em auto;

        }
    }
</style>
<script>
    export default {
        computed: {
            pagesCount() {
                return Math.ceil(this.searchData.length / this.count);
            },
            searchData() {
                let data = this.placemarkData;
                if (this.search !== '') {
                    let search = this.search.toLocaleLowerCase();
                    data = data.filter(item => {
                        return item.name.toLocaleLowerCase().indexOf(search) !== -1;
                    })
                }
                return data;
            },
            paginatedData() {
                return this.searchData.slice((this.page - 1) * this.count, this.page * this.count)
            }
        },
        methods: {
            login() {
                fetch('/list/check-code', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code: this.code
                    })
                }).then(response => response.json()).then(res => {
                    if (res.status) {
                        localStorage.setItem('bizalert_code', this.code);
                        this.loggedIn = true;
                    } else {
                        alert(res.text);
                    }
                })

            },
            addToMain(item) {
                fetch('/list/add-to-main', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: item._id,
                        code: this.code
                    })
                }).then(response => response.json()).then(res => {
                    if (res.status) {
                        this.$set(item, 'show_on_main', true);
                    } else {
                        alert(res.text);
                    }
                })
            },
            removeFromMain(item) {
                fetch('/list/remove-from-main', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: item._id,
                        code: this.code
                    })
                }).then(response => response.json()).then(res => {
                    if (res.status) {
                        this.$set(item, 'show_on_main', false);
                    } else {
                        alert(res.text);
                    }
                })
            }
        },
        data() {
            return {
                search: '',
                page: 1,
                count: 100,
                code: '',
                loggedIn: false,
            }
        },
        mounted() {
            let code = localStorage.getItem('bizalert_code');
            if (code) {
                this.code = code;
                this.loggedIn = true;
            }
        },
        async asyncData() {
            let data = await fetch('/list')
            let placemarkData = []
            if (data.ok) {
                placemarkData = await data.json();
            }
            return {placemarkData};
        }
    }
</script>
