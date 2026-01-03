import '../css/DisasterDimensions.css';
import ImageSlider from '../components/ImageSlider';
import mountain from '../assets/ImageSliderPhotos/mountains.jpg';
import river from '../assets/ImageSliderPhotos/river.jpg';
import farmer from '../assets/ImageSliderPhotos/farmer.jpg';
import forest from '../assets/ImageSliderPhotos/forest.jpg';
import garden from '../assets/ImageSliderPhotos/garden.jpg';
import lake from '../assets/ImageSliderPhotos/lake.jpg';
import marsh from '../assets/ImageSliderPhotos/marsh.jpg';
import mechanic from '../assets/ImageSliderPhotos/mechanic.jpg';

const IMAGES = [
    mountain,
    mechanic,
    forest,
    farmer,
    lake,
    marsh
];

function DisasterDimensions() {

    return <div className="disaster-dimensions">
        <ImageSlider images = {IMAGES}/>
    </div>
}

export default DisasterDimensions