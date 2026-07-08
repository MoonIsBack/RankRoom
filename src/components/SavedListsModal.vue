<template>
    <div class="modal-backdrop" @click="$emit('close')">
        <div class="saved-lists-modal" @click.stop>
            <div class="modal-header">
                <div>
                    <p class="modal-label">RankRoom</p>
                    <h2>Gespeicherte Tierlists</h2>
                </div>

                <button class="close-button" @click="$emit('close')">
                    ✕
                </button>
            </div>

            <div class="saved-list">
                <button v-for="list in savedLists" :key="list.id" class="saved-list-item"
                    @click="$emit('open-list', list.id)">
                    <div>
                        <strong>{{ list.name }}</strong>
                        <small>{{ list.description }}</small>
                    </div>

                    <span>Öffnen</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    savedLists: {
        type: Array,
        required: true,
    },
});

defineEmits(["close", "open-list"]);
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;

    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(8px);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 24px;
}

.saved-lists-modal {
    width: 100%;
    max-width: 540px;
    padding: 24px;

    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 28px;

    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
        #101016;

    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
    color: white;
}

.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;

    margin-bottom: 22px;
}

.modal-label {
    margin: 0 0 6px;

    color: #9ca3af;
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.14em;
}

.modal-header h2 {
    margin: 0;

    font-size: 2rem;
    letter-spacing: -0.06em;
}

.close-button {
    width: 44px;
    height: 44px;

    border: none;
    border-radius: 16px;

    background: rgba(255, 255, 255, 0.075);
    color: white;

    font-size: 1rem;
    font-weight: 900;
    cursor: pointer;

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.13);
    transform: rotate(6deg);
}

.saved-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.saved-list-item {
    width: 100%;
    padding: 16px 18px;

    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 20px;

    background: rgba(255, 255, 255, 0.045);
    color: white;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;

    text-align: left;
    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.saved-list-item:hover {
    background: rgba(255, 255, 255, 0.085);
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
}

.saved-list-item strong {
    display: block;

    font-size: 1rem;
    letter-spacing: -0.03em;
}

.saved-list-item small {
    display: block;
    margin-top: 5px;

    color: #9ca3af;
    font-size: 0.85rem;
    font-weight: 700;
}

.saved-list-item span {
    color: #c4b5fd;
    font-size: 0.85rem;
    font-weight: 900;
    white-space: nowrap;
}

@media (max-width: 600px) {
    .saved-lists-modal {
        padding: 20px;
    }

    .modal-header h2 {
        font-size: 1.55rem;
    }

    .saved-list-item {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>