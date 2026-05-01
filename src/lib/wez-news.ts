export interface WEZNewsItem {
    id: string;
    title: string;
    date: string;
    category: 'Event' | 'News' | 'Competition' | 'Fundraiser';
    description: string;
    link: string;
    icon?: string;
}

export const WEZ_NEWS: WEZNewsItem[] = [
    {
        id: 'photo-2025',
        title: 'Photographic Competition 2025',
        date: 'Ongoing',
        category: 'Competition',
        description: 'The annual WEZ photographic competition is now open. Capture the essence of Zimbabwe\'s wildlife and heritage for a chance to be featured in the Bushbeat magazine.',
        link: 'https://wezmat.org/photographic-competition-2025/',
        icon: '📸'
    },
    {
        id: 'plw-2025',
        title: 'Pumping Legs for Water (PLW)',
        date: 'Sept 2025',
        category: 'Fundraiser',
        description: 'Our flagship fundraising cycle ride in Hwange National Park. Raising critical funds to maintain essential water points for wildlife during the dry season.',
        link: 'https://wezmat.org/pumping-legs-for-water/',
        icon: '🚴'
    },
    {
        id: 'schools-quiz-2024',
        title: 'Junior Schools Wildlife Quiz',
        date: 'Nov 2024',
        category: 'Event',
        description: 'Matabeleland regional wildlife quiz for junior schools. Encouraging the next generation of conservationists through environmental education.',
        link: 'https://wezmat.org/matabeleland-junior-schools-quiz-2024/',
        icon: '🎓'
    },
    {
        id: 'bushbeat-save',
        title: 'Save the Bushbeat Magazine',
        date: 'Action Required',
        category: 'News',
        description: 'Appealing for funds to keep our children\'s wildlife magazine alive. Educating over 15,000 students across Zimbabwe about our natural heritage.',
        link: 'https://wezmat.org/bushbeat-mag/',
        icon: '📖'
    }
];

export const WEZ_DIRECTIVES = {
    mission: "To encourage and assist all people of Zimbabwe to understand the importance of wildlife and the environment and to conserve natural resources for current and future generations.",
    vision: "To ensure that the utilization of natural resources is fair, sustainable, and scientifically validated.",
    registration: "Reg. Pvt. Vol. Org. Number P.V.O. 204/68"
};
